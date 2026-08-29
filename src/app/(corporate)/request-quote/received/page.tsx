import type { Metadata } from "next";
import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb, isDatabaseConfigured } from "@/lib/db/client";
import { quoteAccessTokens, quotes } from "@/lib/db/schema";
import { readGuestSessionId } from "@/lib/session/guest";

export const metadata: Metadata = {
  title: "RFQ received",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ number?: string; token?: string; attachments?: string }>;
};

export default async function RfqReceivedPage({ searchParams }: PageProps) {
  if (!isDatabaseConfigured()) {
    notFound();
  }

  const { number, token: tokenParam, attachments } = await searchParams;
  const sessionId = await readGuestSessionId();
  if (!number || !sessionId) {
    notFound();
  }

  const db = getDb();
  const [quote] = await db
    .select()
    .from(quotes)
    .where(
      and(
        eq(quotes.number, number),
        eq(quotes.sessionId, sessionId),
      ),
    )
    .limit(1);

  if (!quote || quote.status === "draft") {
    notFound();
  }

  let token = tokenParam ?? null;
  if (!token) {
    const [access] = await db
      .select()
      .from(quoteAccessTokens)
      .where(eq(quoteAccessTokens.quoteId, quote.id))
      .limit(1);
    token = access?.token ?? null;
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-sm tracking-[0.16em] text-slate uppercase">Quotation</p>
      <h1 className="mt-2 text-3xl text-ink">RFQ {quote.number} received</h1>
      <p className="mt-4 text-slate">
        PaperSource will review this request. Quoted prices are set by sales —
        the catalogue preview is not the legal total. WhatsApp can discuss the
        quote; it does not replace this submission.
      </p>
      {attachments === "failed" ? (
        <p role="alert" className="mt-4 border border-error/40 bg-cream px-4 py-3 text-sm text-error">
          The request was saved, but the attachments could not be stored. Open
          the quotation and WhatsApp the files with this quote number.
        </p>
      ) : null}
      {token ? (
        <p className="mt-6">
          <Link href={`/quote/${token}`} className="underline">
            View this quotation
          </Link>
        </p>
      ) : null}
      <p className="mt-8">
        <Link href="/shop" className="underline">
          Continue shopping
        </Link>
      </p>
    </main>
  );
}
