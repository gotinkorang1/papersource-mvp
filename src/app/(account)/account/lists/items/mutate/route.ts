import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCustomer } from "@/lib/customer/require";
import { removeSavedListItem, SavedListError } from "@/features/saved-lists/repository";

function resultPath(listId: string, kind: "message" | "error", value: string) {
  return `/account/lists/${encodeURIComponent(listId)}?${kind}=${encodeURIComponent(value)}`;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const listId = String(formData.get("listId") ?? "");
  const actor = await requireCustomer(listId ? `/account/lists/${listId}` : "/account/lists");
  let message = "";

  try {
    if (String(formData.get("intent") ?? "") !== "remove" || !listId) throw new SavedListError("That saved-list action is not available.");
    const itemId = String(formData.get("itemId") ?? "");
    if (!itemId) throw new SavedListError("That saved-list item was not found.");
    await removeSavedListItem(actor, { listId, itemId });
    message = "Item removed.";
  } catch (error) {
    const detail = error instanceof Error ? error.message : "We could not update that saved list.";
    redirect(resultPath(listId || "", "error", detail));
  }

  revalidatePath("/account/lists");
  revalidatePath(`/account/lists/${listId}`);
  redirect(resultPath(listId, "message", message));
}
