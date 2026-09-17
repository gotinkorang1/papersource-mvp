import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCustomer } from "@/lib/customer/require";
import { addSavedListItem, getSavedList, removeSavedListItem, SavedListError } from "@/features/saved-lists/repository";
import { addVariantToCart } from "@/features/cart/repository";
import { addVariantToQuote } from "@/features/quotations/repository";
import { readCommerceIdentity } from "@/lib/customer/commerce";

function resultPath(listId: string, kind: "message" | "error", value: string) {
  return `/account/lists/${encodeURIComponent(listId)}?${kind}=${encodeURIComponent(value)}`;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const listId = String(formData.get("listId") ?? "");
  const actor = await requireCustomer(listId ? `/account/lists/${listId}` : "/account/lists");
  let message = "";
  let destination: "/cart" | "/quote" | null = null;

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
      const identity = await readCommerceIdentity(true);
      for (const item of availableItems) {
        if (intent === "bulk-cart") await addVariantToCart(identity, item.variantId, item.quantity);
        else await addVariantToQuote(identity, item.variantId, item.quantity);
      }
      destination = intent === "bulk-cart" ? "/cart" : "/quote";
    } else {
      throw new SavedListError("That saved-list action is not available.");
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message : "We could not update that saved list.";
    redirect(resultPath(listId || "", "error", detail));
  }

  revalidatePath("/account/lists");
  revalidatePath(`/account/lists/${listId}`);
  if (destination) redirect(destination);
  redirect(resultPath(listId, "message", message));
}
