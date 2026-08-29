import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { QuoteAdminActions } from "@/components/admin/quote-admin-actions";
import { getQuoteForAdmin } from "@/features/quotations/admin";
import { formatGhs } from "@/lib/money";
import { signedDocumentPath } from "@/lib/documents/sign";
import { publicEnv } from "@/lib/env";
import { requireStaffArea } from "@/lib/staff/require";

export const metadata: Metadata = {
  title: "Quote",
};

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminQuoteDetailPage({
  params,
  searchParams,
}: PageProps) {
  const actor = await requireStaffArea("quotes", "read");
  const { id } = await params;
  const { error } = await searchParams;
  const quote = await getQuoteForAdmin(actor.role, id);
  if (!quote) {
    notFound();
  }

  const site = publicEnv.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const customerUrl = quote.customerToken ? `${site}/quote/${quote.customerToken}` : null;

  return (
    <main>
      <p className="text-sm tracking-[0.16em] text-slate uppercase">
        <Link href="/admin/quotes" className="underline">
          Quotes
        </Link>
      </p>
      <h1 className="mt-2 font-heading text-3xl text-ink">
        {quote.number ?? "Quotation"}
      </h1>
      <p className="mt-2 text-sm text-slate">
        Status: <span className="text-ink">{quote.status.replaceAll("_", " ")}</span>
        {quote.expiresAt ? ` · Expires ${quote.expiresAt.toISOString().slice(0, 10)}` : ""}
        {quote.parentQuoteId ? " · Revision of an earlier quotation" : ""}
      </p>
      {error ? (
        <p role="alert" className="mt-4 border border-error/40 bg-white px-4 py-3 text-sm text-error">
          {error}
        </p>
      ) : null}
      <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-slate">Organisation</dt>
          <dd className="text-ink">{quote.organizationName ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-slate">Contact</dt>
          <dd className="text-ink">
            {quote.contactName} · {quote.guestEmail} · {quote.guestPhone}
          </dd>
        </div>
        <div>
          <dt className="text-slate">Notes</dt>
          <dd className="text-ink">{quote.notes || "None"}</dd>
        </div>
        <div>
          <dt className="text-slate">Goods</dt>
          <dd className="tabular-nums text-ink">{formatGhs(quote.goodsTotal)}</dd>
        </div>
        <div>
          <dt className="text-slate">Delivery</dt>
          <dd className="tabular-nums text-ink">
            {quote.deliveryFeeStatus === "pending_nationwide"
              ? "To be confirmed"
              : formatGhs(quote.deliveryFee)}
          </dd>
        </div>
        <div>
          <dt className="text-slate">Grand total</dt>
          <dd className="tabular-nums text-ink">{formatGhs(quote.grandTotal)}</dd>
        </div>
      </dl>
      {customerUrl ? (
        <p className="mt-6 text-sm">
          Customer link:{" "}
          <Link href={`/quote/${quote.customerToken}`} className="underline" data-testid="customer-quote-link">
            {customerUrl}
          </Link>
        </p>
      ) : null}
      {quote.documents.length > 0 ? (
        <section className="mt-8">
          <h2 className="font-heading text-xl text-ink">Attachments</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {quote.documents.map((document) => (
              <li key={document.id}>
                <a
                  href={signedDocumentPath(document.id)}
                  className="underline"
                >
                  {document.filename}
                </a>
                <span className="text-slate"> · {document.purpose.replaceAll("_", " ")}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <div className="mt-8">
        <QuoteAdminActions
          quoteId={quote.id}
          status={quote.status}
          role={actor.role}
          lines={quote.lines}
          deliveryFee={quote.deliveryFee}
        />
      </div>
      <section className="mt-10">
        <h2 className="font-heading text-xl text-ink">Timeline</h2>
        <ol className="mt-3 space-y-2 text-sm">
          {quote.events.map((event) => (
            <li key={event.id} className="text-slate">
              {event.fromStatus ?? "—"} → {event.toStatus} ({event.actorType})
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
