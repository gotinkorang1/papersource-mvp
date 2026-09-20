"use client";

import { paperButton } from "@/components/commerce/paper-button";
import { useFormStatus } from "react-dom";

function AcceptSubmitButton() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} aria-busy={pending} className={`${paperButton()} disabled:cursor-wait disabled:opacity-60`}>{pending ? "Accepting…" : "Accept Quote"}</button>;
}

export function AcceptQuoteButton({
  token,
  error,
}: {
  token: string;
  error?: string;
}) {
  return (
    <form action="/quote/accept" method="post" className="space-y-3">
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
