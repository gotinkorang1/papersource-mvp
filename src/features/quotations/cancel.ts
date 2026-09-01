import { and, eq } from "drizzle-orm";
import type { CommerceIdentity } from "@/lib/customer/commerce-identity";
import { getDb } from "@/lib/db/client";
import { quoteEvents, quotes } from "@/lib/db/schema";
import { getQuoteByAccessToken, QuoteAcceptError } from "./accept";
import { assertQuoteTransition, QuoteTransitionError } from "./transitions";

export async function cancelQuoteByToken(token: string, identity?: CommerceIdentity) {
  const found = await getQuoteByAccessToken(token, identity);
  if (!found) {
    throw new QuoteAcceptError("That quotation was not found.");
  }
  if (found.status !== "submitted" && found.status !== "draft") {
    throw new QuoteAcceptError(
      "This quotation can no longer be cancelled. Contact PaperSource if you need to stop it.",
    );
  }

  try {
    assertQuoteTransition(found.status, "cancelled");
  } catch (error) {
    if (error instanceof QuoteTransitionError) {
      throw new QuoteAcceptError(error.message);
    }
    throw error;
  }

  const db = getDb();
  const [updated] = await db
    .update(quotes)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(and(eq(quotes.id, found.id), eq(quotes.status, found.status)))
    .returning();
  if (!updated) {
    throw new QuoteAcceptError("This quotation was already updated.");
  }

  await db.insert(quoteEvents).values({
    quoteId: found.id,
    fromStatus: found.status,
    toStatus: "cancelled",
    actorType: identity?.profileId ? "customer" : "guest",
    actorId: identity?.profileId ?? undefined,
    payload: { token: true },
  });

  return { number: updated.number ?? found.id };
}

export async function declineQuoteByToken(token: string, identity?: CommerceIdentity) {
  const found = await getQuoteByAccessToken(token, identity);
  if (!found) {
    throw new QuoteAcceptError("That quotation was not found.");
  }
  if (found.status !== "sent") {
    throw new QuoteAcceptError("Only a sent quotation can be declined.");
  }

  try {
    assertQuoteTransition(found.status, "declined");
  } catch (error) {
    if (error instanceof QuoteTransitionError) {
      throw new QuoteAcceptError(error.message);
    }
    throw error;
  }

  const db = getDb();
  const [updated] = await db
    .update(quotes)
    .set({ status: "declined", updatedAt: new Date() })
    .where(and(eq(quotes.id, found.id), eq(quotes.status, "sent")))
    .returning();
  if (!updated) {
    throw new QuoteAcceptError("This quotation is no longer waiting for a decision.");
  }

  await db.insert(quoteEvents).values({
    quoteId: found.id,
    fromStatus: "sent",
    toStatus: "declined",
    actorType: identity?.profileId ? "customer" : "guest",
    actorId: identity?.profileId ?? undefined,
    payload: { token: true },
  });

  return { number: updated.number ?? found.id };
}
