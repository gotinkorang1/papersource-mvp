import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCustomer } from "@/lib/customer/require";
import { addSavedListItem, getSavedList, removeSavedListItem, SavedListError } from "@/features/saved-lists/repository";
import { addVariantToCart } from "@/features/cart/repository";
import { addVariantToQuote } from "@/features/quotations/repository";
import { readCommerceIdentity } from "@/lib/customer/commerce";
import { captureServerException } from "@/lib/observability/sentry";

function resultPath(listId: string, kind: "message" | "error", value: string) {
  return `/account/lists/${encodeURIComponent(listId)}?${kind}=${encodeURIComponent(value)}`;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const listId = String(formData.get("listId") ?? "");
  const actor = await requireCustomer(listId ? `/account/lists/${listId}` : "/account/lists");
  let message = "";
  let destination: string | null = null;

  try {
    const intent = String(formData.get("intent") ?? "");
    if (!listId) throw new SavedListError("That saved-list action is not available.");
    if (intent === "remove") {
      const itemId = String(formData.get("itemId") ?? "");
      if (!itemId) throw new SavedListError("That saved-list item was not found.");
      await removeSavedListItem(actor, { listId, itemId });
      message = "Item removed.";
    } else if (intent === "add") {
      const variantId = String(formData.get("variantId") ?? "");
      if (!variantId) throw new SavedListError("That product variant was not found.");
      await addSavedListItem(actor, { listId, variantId, quantity: String(formData.get("quantity") ?? "1") });
      message = "Item saved.";
    } else if (intent === "bulk-cart" || intent === "bulk-quote") {
      const list = await getSavedList(actor, listId);
      const availableItems = list.items.filter((item) => item.productActive && item.variantActive);
      if (!availableItems.length) throw new SavedListError("There are no available products to reorder from this list.");
      const unavailableCount = list.items.length - availableItems.length;
      const identity = await readCommerceIdentity(true);
      let addedCount = 0;
      let failedCount = 0;
      for (const item of availableItems) {
        try {
          if (intent === "bulk-cart") await addVariantToCart(identity, item.variantId, item.quantity);
          else await addVariantToQuote(identity, item.variantId, item.quantity);
          addedCount += 1;
        } catch {
          failedCount += 1;
        }
      }
      if (!addedCount) throw new SavedListError("None of the available products could be added. Please try again.");
      destination = `${intent === "bulk-cart" ? "/cart" : "/quote"}?added=${addedCount}`;
      const skippedCount = unavailableCount + failedCount;
      if (skippedCount) {
        destination += `&warning=${encodeURIComponent(`${skippedCount} item${skippedCount === 1 ? "" : "s"} could not be added.`)}`;
      }
    } else {
      throw new SavedListError("That saved-list action is not available.");
    }
  } catch (error) {
    const detail = error instanceof SavedListError
      ? error.message
      : "We could not update that saved list. Please try again.";
    if (!(error instanceof SavedListError)) {
      captureServerException(error, { operation: "mutate_saved_list_items", dependency: "database" });
    }
    redirect(resultPath(listId || "", "error", detail));
  }

  revalidatePath("/account/lists");
  revalidatePath(`/account/lists/${listId}`);
  revalidatePath("/", "layout");
  revalidatePath("/cart");
  revalidatePath("/quote");
  if (destination) redirect(destination);
  redirect(resultPath(listId, "message", message));
}
