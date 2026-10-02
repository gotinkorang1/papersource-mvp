import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";
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
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 md:py-16 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-paper-green">Business purchasing</p>
      <h1 className="mt-3 font-heading text-4xl font-semibold tracking-tight text-ink md:text-5xl">Your quote list</h1>
      <p className="mt-3 max-w-2xl text-slate">
        Procurement basket. This is not your retail cart. Final prices are set
        by PaperSource.
      </p>
      {added ? (
        <p className="mt-4 text-sm text-ink">
          Added {added} {added === "1" ? "line" : "lines"} to your quote list.
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
        <div className="mt-8 rounded-2xl border border-dashed border-border bg-card p-6 sm:p-8">
          <FileText className="size-8 text-paper-green" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-semibold text-ink">Build your quote list</h2>
          <p className="mt-2 max-w-lg text-slate">Add products from the catalogue or enter known SKUs with Quick Order. We will review your requirements and confirm final pricing.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/shop" className={paperButton({ variant: "quote" })}>Add products to quote</Link>
            <Link href="/quick-order" className={paperButton({ variant: "secondary" })}>Use Quick Order</Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          <table className="w-full rounded-2xl border border-border bg-card text-sm shadow-sm">
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
                        max={9999}
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
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-muted/40 p-5"><p className="text-sm text-slate">Final prices are set by PaperSource after we review your requirements.</p><Link href="/request-quote" className={paperButton({ variant: "quote" })}>Request quotation</Link></div>
        </div>
      )}
    </main>
  );
}
