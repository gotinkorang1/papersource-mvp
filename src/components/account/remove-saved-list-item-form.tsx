"use client";

import { SubmitProgressButton } from "@/components/admin/submit-progress-button";

export function RemoveSavedListItemForm({ listId, itemId }: { listId: string; itemId: string }) {
  return (
    <form
      action="/account/lists/items/mutate"
      method="post"
      onSubmit={(event) => {
        if (!window.confirm("Remove this item from the saved list?")) event.preventDefault();
      }}
    >
      <input type="hidden" name="intent" value="remove" />
      <input type="hidden" name="listId" value={listId} />
      <input type="hidden" name="itemId" value={itemId} />
      <SubmitProgressButton
        idleLabel="Remove"
        pendingLabel="Removing…"
        className="min-h-10 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-slate hover:border-red-300 hover:text-red-700"
      />
    </form>
  );
}
