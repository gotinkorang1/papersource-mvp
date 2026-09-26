import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AcceptQuoteButton } from "@/components/quotes/accept-quote-button";
import { ConfirmQuoteActionForm } from "@/components/quotes/confirm-quote-action-form";
import { readCommerceIdentity } from "@/lib/customer/commerce";
import { getQuoteByAccessToken } from "@/features/quotations/accept";
import { signedDocumentPath } from "@/lib/documents/sign";
import { formatGhs } from "@/lib/money";
import { isDatabaseConfigured } from "@/lib/db/client";

export const metadata: Metadata = {
  title: "Quotation",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string; notice?: string }>;
};

export default async function CustomerQuotePage({ params, searchParams }: PageProps) {
  if (!isDatabaseConfigured()) {
    notFound();
  }

  const { token } = await params;
  const { error, notice } = await searchParams;
  const quote = await getQuoteByAccessToken(token, await readCommerceIdentity());
  if (!quote) {
    notFound();
  }

  const canAccept = quote.status === "sent";
  const canCancel = quote.status === "submitted" || quote.status === "draft";
  const nationwide = quote.deliveryFeeStatus === "pending_nationwide";

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-sm tracking-[0.16em] text-slate uppercase">Quotation</p>
      <h1 className="mt-2 text-3xl text-ink">{quote.number ?? "Quotation"}</h1>
      <p className="mt-3 text-slate">
        Status: {quote.status.replaceAll("_", " ")}. Prices on this page are set
        by PaperSource, not the live catalogue.
      </p>
      {error && !canAccept && !canCancel ? (
        <p role="alert" className="mt-5 border border-error/40 bg-cream px-4 py-3 text-sm text-error">
          {error}
        </p>
      ) : null}
      <table className="mt-8 w-full text-sm">
        <caption className="sr-only">Quoted lines</caption>
        <thead>
          <tr className="border-b border-border text-left text-slate">
            <th className="py-2 font-medium">Item</th>
            <th className="py-2 font-medium">Qty</th>
            <th className="py-2 font-medium">Line</th>
          </tr>
        </thead>
        <tbody>
          {quote.lines.map((line) => (
            <tr key={line.id} className="border-b border-border">
              <td className="py-3">
                {line.nameSnapshot}
                <span className="block text-xs text-slate">{line.skuSnapshot}</span>
              </td>
              <td className="py-3 tabular-nums">{line.quantity}</td>
              <td className="py-3 tabular-nums">
                {line.lineTotal === null ? "—" : formatGhs(line.lineTotal)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <dl className="mt-6 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate">Goods</dt>
          <dd className="tabular-nums">{formatGhs(quote.goodsTotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate">Delivery</dt>
          <dd className="tabular-nums">
            {nationwide ? "To be confirmed" : formatGhs(quote.deliveryFee)}
          </dd>
        </div>
        <div className="flex justify-between font-medium">
          <dt>Total</dt>
          <dd className="tabular-nums">{formatGhs(quote.grandTotal)}</dd>
        </div>
      </dl>
      {quote.documents.length > 0 ? (
        <section className="mt-8">
          <h2 className="font-heading text-xl text-ink">Attachments</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {quote.documents.map((document) => (
              <li key={document.id}>
                <a href={signedDocumentPath(document.id)} className="underline">
                  {document.filename}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {notice === "cancelled" || quote.status === "cancelled" ? (
        <p className="mt-8 text-slate">This quotation has been cancelled.</p>
      ) : notice === "declined" || quote.status === "declined" ? (
        <p className="mt-8 text-slate">You declined this quotation.</p>
      ) : canAccept ? (
        <div className="mt-8 space-y-4">
          <AcceptQuoteButton token={token} error={error} />
          <ConfirmQuoteActionForm
            action="/quote/decline"
            token={token}
            idleLabel="Decline this quotation"
            pendingLabel="Declining…"
            confirmation="Decline this quotation? This decision cannot be undone."
          />
        </div>
      ) : (
        <p className="mt-8 text-slate">
          {quote.status === "expired"
            ? "This quotation has expired. Ask PaperSource for a revision."
            : quote.status === "revised"
              ? "This version was superseded. Use the latest quotation in your email."
              : quote.status === "payment_pending" || quote.status === "accepted"
                ? "This quotation has been accepted."
                : "PaperSource is still reviewing this request."}
        </p>
      )}
      {canCancel ? (
        <div className="mt-6">
          {error ? (
            <p role="alert" className="mb-3 border border-error/40 bg-cream px-4 py-3 text-sm text-error">
              {error}
            </p>
          ) : null}
          <ConfirmQuoteActionForm
            action="/quote/cancel"
            token={token}
            idleLabel="Cancel this request"
            pendingLabel="Cancelling…"
            confirmation="Cancel this quotation request? This cannot be undone."
          />
        </div>
      ) : null}
      <p className="mt-8">
        <Link href="/shop" className="underline">
          Continue shopping
        </Link>
      </p>
    </main>
  );
}
