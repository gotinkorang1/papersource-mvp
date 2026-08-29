import type { QuoteStatus } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { quoteEvents, quotes } from "@/lib/db/schema";
import { assertQuoteTransition } from "./transitions";

export function isQuotePastExpiry(
  quote: { status: QuoteStatus; expiresAt: Date | null },
  now = new Date(),
) {
  return (
    quote.status === "sent" &&
    quote.expiresAt !== null &&
    quote.expiresAt.getTime() <= now.getTime()
  );
}

export async function expireQuoteIfStale(quoteId: string) {
  const db = getDb();
  const [quote] = await db
    .select()
    .from(quotes)
    .where(eq(quotes.id, quoteId))
    .limit(1);
  if (!quote || !isQuotePastExpiry(quote)) {
    return quote ?? null;
  }

  assertQuoteTransition(quote.status, "expired");
  const [updated] = await db
    .update(quotes)
    .set({ status: "expired", updatedAt: new Date() })
    .where(and(eq(quotes.id, quote.id), eq(quotes.status, "sent")))
    .returning();
  if (!updated) {
    return quote;
  }
  await db.insert(quoteEvents).values({
    quoteId: quote.id,
    fromStatus: "sent",
    toStatus: "expired",
    actorType: "system",
    payload: { expiresAt: quote.expiresAt?.toISOString() },
  });
  return updated;
}
