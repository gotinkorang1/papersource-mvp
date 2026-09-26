"use client";

import Link from "next/link";
import { PaperDrawer } from "@/components/commerce/paper-drawer";
import { paperButton } from "@/components/commerce/paper-button";
import { formatGhs } from "@/lib/money";
import { useDualPathPreview } from "@/features/preview/dual-path-preview";

export function QuoteBasket() {
  const { quoteLines, quoteOpen, setQuoteOpen, clearQuote, syncError, clearSyncError } = useDualPathPreview();
  const previewTotal = quoteLines.reduce(
    (sum, line) => sum + (line.unitPricePesewas ?? 0) * line.quantity,
    0,
  );
  function confirmClearQuote() {
    if (window.confirm("Clear all items from your quote list?")) clearQuote();
  }

  return (
    <PaperDrawer
      open={quoteOpen}
      title="Quote list"
      description="Procurement basket. This is not your retail cart."
      onClose={() => setQuoteOpen(false)}
      footer={
        <>
          {quoteLines.length > 0 && previewTotal > 0 ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-slate">Preview {formatGhs(previewTotal)} — final quote prices are set by PaperSource.</p>
              <button type="button" onClick={confirmClearQuote} className="inline-flex min-h-11 shrink-0 items-center text-xs font-medium text-error underline underline-offset-2 transition hover:text-error/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Clear quote</button>
            </div>
          ) : null}
          {quoteLines.length > 0 && previewTotal === 0 ? <button type="button" onClick={confirmClearQuote} className="inline-flex min-h-11 self-end items-center text-xs font-medium text-error underline underline-offset-2 transition hover:text-error/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Clear quote</button> : null}
          <div className="flex flex-col gap-2">
            <Link
              href="/quote"
              className={paperButton({ variant: "secondary" })}
              onClick={() => setQuoteOpen(false)}
            >
              View quote list
            </Link>
            {quoteLines.length > 0 ? (
              <Link
                href="/request-quote"
                className={paperButton({ variant: "quote" })}
                onClick={() => setQuoteOpen(false)}
              >
                Request quotation
              </Link>
            ) : (
              <button type="button" disabled className={paperButton({ variant: "quote" })}>
                Request quotation
              </button>
            )}
          </div>
        </>
      }
    >
      {syncError ? <div role="alert" aria-live="assertive" className="mb-4 flex items-start justify-between gap-3 rounded-md border border-error/40 bg-error/10 px-3 py-2 text-sm text-error"><p>{syncError}</p><button type="button" onClick={clearSyncError} className="inline-flex min-h-11 shrink-0 items-center font-semibold underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Dismiss</button></div> : null}
      {quoteLines.length === 0 ? (
        <div className="space-y-3">
          <p className="text-sm text-slate">No items on this quotation yet.</p>
          <Link href="/quick-order" className={paperButton({ variant: "quote" })} onClick={() => setQuoteOpen(false)}>
            Use Quick Order
          </Link>
        </div>
      ) : (
        <table className="w-full text-sm">
          <caption className="sr-only">Quote lines</caption>
          <thead>
            <tr className="border-b border-border text-left text-slate">
              <th className="py-2 font-normal">Item</th>
              <th className="py-2 font-normal">Qty</th>
            </tr>
          </thead>
          <tbody>
            {quoteLines.map((line) => (
              <tr key={line.id} className="border-b border-border">
                <td className="py-2">
                  <p className="font-medium text-ink">{line.name}</p>
                  <p className="font-mono text-xs text-slate">{line.sku}</p>
                  <p className="text-slate">{line.specLine}</p>
                </td>
                <td className="py-2 align-top tabular-nums text-ink">
                  {line.quantity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </PaperDrawer>
  );
}
