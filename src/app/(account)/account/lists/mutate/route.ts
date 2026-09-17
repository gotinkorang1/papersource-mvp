import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCustomer } from "@/lib/customer/require";
import { SavedListError, createSavedList, deleteSavedList } from "@/features/saved-lists/repository";

function resultPath(kind: "message" | "error", value: string) {
  return `/account/lists?${kind}=${encodeURIComponent(value)}`;
}

export async function POST(request: Request) {
  const actor = await requireCustomer("/account/lists");
  const formData = await request.formData();
  const intent = String(formData.get("intent") ?? "");
  let message = "";
  try {
    if (intent === "create") {
      await createSavedList(actor, { name: String(formData.get("name") ?? ""), description: String(formData.get("description") ?? "") });
      message = "Saved list created.";
    } else if (intent === "delete") {
      const listId = String(formData.get("listId") ?? "");
      if (!listId) throw new SavedListError("That saved list was not found.");
      await deleteSavedList(actor, listId);
      message = "Saved list deleted.";
    } else {
      throw new SavedListError("That saved-list action is not available.");
    }
  } catch (error) {
    if (error instanceof SavedListError || error instanceof Error) redirect(resultPath("error", error.message));
    redirect(resultPath("error", "We could not update your saved lists."));
  }
  revalidatePath("/account/lists");
  redirect(resultPath("message", message));
}
