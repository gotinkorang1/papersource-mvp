"use client";

import { SubmitProgressButton } from "@/components/admin/submit-progress-button";

export function ConfirmQuoteActionForm({
  action,
  token,
  idleLabel,
  pendingLabel,
  confirmation,
}: {
  action: "/quote/cancel" | "/quote/decline";
  token: string;
  idleLabel: string;
  pendingLabel: string;
  confirmation: string;
}) {
  return (
    <form
      action={action}
      method="post"
      onSubmit={(event) => {
        if (!window.confirm(confirmation)) {
          event.preventDefault();
          event.currentTarget.dispatchEvent(new Event("submitcancelled"));
        }
      }}
    >
      <input type="hidden" name="token" value={token} />
      <SubmitProgressButton
        idleLabel={idleLabel}
        pendingLabel={pendingLabel}
        className="text-sm underline text-slate disabled:no-underline"
      />
    </form>
  );
}
