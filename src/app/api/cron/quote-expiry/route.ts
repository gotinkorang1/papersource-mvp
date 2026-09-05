import { NextResponse } from "next/server";
import { and, eq, gte, isNull, lte } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { quoteAccessTokens, quotes } from "@/lib/db/schema";
import { notifyQuoteExpiring } from "@/lib/email/notify";
import { customerEmailFromSnapshot } from "@/lib/email/snapshot";
import { captureServerException } from "@/lib/observability/sentry";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return new NextResponse("Unauthorized", { status: 401 });
  const now = new Date();
  const from = new Date(now.getTime() + 47 * 60 * 60 * 1000);
  const to = new Date(now.getTime() + 49 * 60 * 60 * 1000);
  try {
    const db = getDb();
    const candidates = await db.select({ quote: quotes, token: quoteAccessTokens.token }).from(quotes).leftJoin(quoteAccessTokens, eq(quoteAccessTokens.quoteId, quotes.id)).where(and(eq(quotes.status, "sent"), gte(quotes.expiresAt, from), lte(quotes.expiresAt, to), isNull(quotes.expiryReminderSentAt))).limit(100);
    let sent = 0;
    for (const row of candidates) {
      const claimed = await db.update(quotes).set({ expiryReminderSentAt: now, updatedAt: now }).where(and(eq(quotes.id, row.quote.id), isNull(quotes.expiryReminderSentAt))).returning({ id: quotes.id });
      if (!claimed.length) continue;
      await notifyQuoteExpiring({ quoteId: row.quote.id, number: row.quote.number ?? "Your quotation", token: row.token ?? null, email: row.quote.guestEmail ?? customerEmailFromSnapshot(row.quote.addressSnapshot) ?? null, contactName: row.quote.contactName });
      sent++;
    }
    return NextResponse.json({ sent });
  } catch (error) {
    captureServerException(error, { operation: "quote_expiry_cron", route: new URL(request.url).pathname, dependency: "postgres_or_email" });
    return NextResponse.json({ error: "Quote expiry job failed" }, { status: 500 });
  }
}
