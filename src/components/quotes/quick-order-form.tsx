"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { paperButton } from "@/components/commerce/paper-button";

const EMPTY_ROWS = 8;

function QuickOrderSubmitButton({ destination, label, className, submittedDestination }: { destination: "quote" | "cart"; label: string; className: string; submittedDestination: "quote" | "cart" | null }) {
  const { pending } = useFormStatus();
  const busy = pending || submittedDestination === destination;
  return <button type="submit" name="destination" value={destination} disabled={busy || (submittedDestination !== null && submittedDestination !== destination)} aria-busy={busy} aria-live="polite" className={`${className} disabled:cursor-wait disabled:opacity-60`}>
    {busy ? <span aria-hidden="true" className="mr-2 inline-block size-3 animate-spin rounded-full border-2 border-current border-r-transparent align-[-0.1em]" /> : null}
    {busy ? "Adding…" : label}
  </button>;
}

export function QuickOrderForm() {
  const [rows, setRows] = useState(EMPTY_ROWS);
  const [submittedDestination, setSubmittedDestination] = useState<"quote" | "cart" | null>(null);

  return (
    <form
      action="/quick-order/add"
      method="post"
      className="mt-8"
      onSubmit={(event) => {
        const submitter = (event.nativeEvent as SubmitEvent).submitter;
        setSubmittedDestination(submitter instanceof HTMLButtonElement && submitter.value === "cart" ? "cart" : "quote");
      }}
    >
      <div className="overflow-x-auto rounded-md border border-border bg-white">
        <table className="w-full text-sm">
          <caption className="sr-only">SKU and quantity grid</caption>
          <thead>
            <tr className="border-b border-border text-left text-slate">
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }, (_, index) => (
              <tr key={index} className="border-b border-border last:border-0">
                <td className="px-4 py-2">
                  <label className="sr-only" htmlFor={`quick-sku-${index}`}>
                    SKU {index + 1}
                  </label>
                  <input
                    id={`quick-sku-${index}`}
                    name="sku"
                    autoComplete="off"
                    spellCheck={false}
                    className="h-11 w-full rounded-md border border-border bg-cream px-3 font-mono text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                  />
                </td>
                <td className="px-4 py-2">
                  <label className="sr-only" htmlFor={`quick-qty-${index}`}>
                    Quantity {index + 1}
                  </label>
                  <input
                    id={`quick-qty-${index}`}
                    name="quantity"
                    type="number"
                    min={1}
                    max={9999}
                    className="h-11 w-24 rounded-md border border-border bg-cream px-3 tabular-nums text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          className="inline-flex min-h-11 items-center text-sm text-ink underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          onClick={() => setRows((current) => current + 4)}
        >
          Add more rows
        </button>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <QuickOrderSubmitButton destination="quote" label="Add all to Quote" submittedDestination={submittedDestination} className={paperButton({ variant: "quote" })} />
        <QuickOrderSubmitButton destination="cart" label="Add all to Cart" submittedDestination={submittedDestination} className={paperButton({ variant: "secondary" })} />
      </div>
    </form>
  );
}
