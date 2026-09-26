import type { Metadata } from "next";
import Link from "next/link";
import {
  removeQuoteLineAction,
  updateQuoteQuantityAction,
} from "@/features/quotations/actions";
import { listQuoteLines } from "@/features/quotations/repository";
import { paperButton } from "@/components/commerce/paper-button";
import { SubmitProgressButton } from "@/components/admin/submit-progress-button";
import { formatGhs } from "@/lib/money";
import { isDatabaseConfigured } from "@/lib/db/client";
import { readCommerceIdentity } from "@/lib/customer/commerce";

export const metadata: Metadata = {
  title: "Quote list",
  robots: { index: false, follow: true },
};

type PageProps = {
  searchParams: Promise<{ added?: string; unknown?: string; notice?: string; warning?: string }>;
};

export default async function QuoteBasketPage({ searchParams }: PageProps) {
  const sessionId = isDatabaseConfigured() ? await readCommerceIdentity() : null;
  const lines = sessionId ? await listQuoteLines(sessionId) : [];
  const { added, unknown, notice, warning } = await searchParams;

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl text-ink">Quote list</h1>
      <p className="mt-3 text-slate">
        Procurement basket. This is not your retail cart. Final prices are set
        by PaperSource.
      </p>
      {added ? (
        <p className="mt-4 text-sm text-ink">
          Added {added} {added === "1" ? "line" : "lines"} from Quick Order.
        </p>
      ) : null}
      {unknown ? (
        <p role="alert" className="mt-3 text-sm text-error">
          Not found: {unknown}
        </p>
      ) : null}
      {notice ? <p role="status" className="mt-3 text-sm text-paper-green">{notice === "updated" ? "Quantity updated." : notice === "removed" ? "Item removed from quote list." : notice}</p> : null}
      {warning ? <p role="alert" className="mt-3 text-sm text-error">{warning}</p> : null}
      {lines.length === 0 ? (
        <div className="mt-8 space-y-4">
          <p className="text-slate">No items on this quotation yet. Add products from the catalogue or use Quick Order for known SKUs.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/shop" className={paperButton({ variant: "quote" })}>Add products to quote</Link>
            <Link href="/quick-order" className={paperButton({ variant: "secondary" })}>Use Quick Order</Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          <table className="w-full text-sm">
            <caption className="sr-only">Quote lines</caption>
            <thead>
              <tr className="border-b border-border text-left text-slate">
                <th className="py-2 font-normal">Item</th>
                <th className="py-2 font-normal">Qty</th>
                <th className="py-2 font-normal">Preview</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => (
                <tr key={line.id} className="border-b border-border align-top">
                  <td className="py-3">
                    <p className="font-medium text-ink">{line.name}</p>
                    <p className="font-mono text-xs text-slate">{line.sku}</p>
                    <p className="text-slate">{line.specLine}</p>
                    <form action={removeQuoteLineAction} className="mt-2">
                      <input type="hidden" name="variantId" value={line.id} />
                      <SubmitProgressButton idleLabel="Remove" pendingLabel="Removing…" className="text-sm text-error underline" />
                    </form>
                  </td>
                  <td className="py-3">
                    <form action={updateQuoteQuantityAction} className="flex items-center gap-2">
                      <input type="hidden" name="variantId" value={line.id} />
                      <input
                        name="quantity"
                        type="number"
                        inputMode="numeric"
                        min={1}
                        defaultValue={line.quantity}
                        aria-label={`Quantity for ${line.name}`}
                        className="h-11 w-16 rounded-md border border-border bg-cream px-2 tabular-nums focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                      />
                      <SubmitProgressButton idleLabel="Update" pendingLabel="Updating…" className="text-slate underline" />
                    </form>
                  </td>
                  <td className="py-3 tabular-nums text-ink">
                    {line.unitPricePesewas === null
                      ? "Request quote"
                      : formatGhs(line.unitPricePesewas)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Link href="/request-quote" className={paperButton({ variant: "quote" })}>
            Request quotation
          </Link>
        </div>
      )}
    </main>
  );
}
