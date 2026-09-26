"use client";

import { paperButton } from "@/components/commerce/paper-button";
import { useFormStatus } from "react-dom";

function AcceptSubmitButton() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} aria-busy={pending} aria-live="polite" className={`${paperButton()} disabled:cursor-wait disabled:opacity-60`}>
    {pending ? <span aria-hidden="true" className="mr-2 inline-block size-3 animate-spin rounded-full border-2 border-current border-r-transparent align-[-0.1em]" /> : null}
    {pending ? "Accepting…" : "Accept Quote"}
  </button>;
}

export function AcceptQuoteButton({
  token,
  error,
}: {
  token: string;
  error?: string;
}) {
  return (
    <form
      action="/quote/accept"
      method="post"
      className="space-y-3"
      onSubmit={(event) => {
        if (!window.confirm("Accept this quotation and continue to the order/payment process?")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="token" value={token} />
      {error ? (
        <p role="alert" className="border border-error/40 bg-cream px-4 py-3 text-sm text-error">
          {error}
        </p>
      ) : null}
      <AcceptSubmitButton />
    </form>
  );
}
