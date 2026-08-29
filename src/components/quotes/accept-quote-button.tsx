"use client";

import { paperButton } from "@/components/commerce/paper-button";

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
      <button type="submit" className={paperButton()}>
        Accept Quote
      </button>
    </form>
  );
}
