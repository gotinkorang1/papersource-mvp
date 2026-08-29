import type { Metadata } from "next";
import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb, isDatabaseConfigured } from "@/lib/db/client";
import { quotes } from "@/lib/db/schema";
import { readGuestSessionId } from "@/lib/session/guest";

export const metadata: Metadata = {
  title: "RFQ received",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ number?: string }>;
};

export default async function RfqReceivedPage({ searchParams }: PageProps) {
  if (!isDatabaseConfigured()) {
    notFound();
  }

  const { number } = await searchParams;
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
        eq(quotes.status, "submitted"),
      ),
    )
    .limit(1);

  if (!quote) {
    notFound();
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
      <p className="mt-8">
        <Link href="/shop" className="underline">
          Continue shopping
        </Link>
      </p>
    </main>
  );
}
