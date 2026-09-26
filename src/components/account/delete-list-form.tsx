"use client";

import { SubmitProgressButton } from "@/components/admin/submit-progress-button";

export function DeleteListForm({ listId }: { listId: string }) {
  return (
    <form
      action="/account/lists/mutate"
      method="post"
      onSubmit={(event) => {
        if (!window.confirm("Delete this saved list? Its items will no longer be grouped for quick replenishment.")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="intent" value="delete" />
      <input type="hidden" name="listId" value={listId} />
      <SubmitProgressButton
        idleLabel="Delete"
        pendingLabel="Deleting…"
        className="text-sm text-slate underline underline-offset-4 hover:text-red-700"
      />
    </form>
  );
}
