"use client";

import { useActionState } from "react";
import { paperButton } from "@/components/commerce/paper-button";
import { startPaystackPaymentAction } from "@/features/payments/actions";

export function PayNowButton({ orderId }: { orderId: string }) {
  const [state, action, pending] = useActionState(startPaystackPaymentAction, null);

  return (
    <form action={action} className="space-y-3" aria-busy={pending}>
      <input type="hidden" name="orderId" value={orderId} />
      {state?.error ? (
        <p role="alert" className="border border-error/40 bg-cream px-4 py-3 text-sm text-error">
          {state.error}
        </p>
      ) : null}
      <button type="submit" className={paperButton({ className: "disabled:cursor-wait" })} disabled={pending} aria-busy={pending} aria-live="polite">
        {pending ? <span aria-hidden="true" className="mr-2 inline-block size-3 animate-spin rounded-full border-2 border-current border-r-transparent align-[-0.1em]" /> : null}
        {pending ? "Starting Paystack…" : "Pay with Paystack"}
      </button>
    </form>
  );
}
