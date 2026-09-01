import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { documentOwner, type CommerceIdentity } from "@/lib/customer/commerce-identity";
import { getDb } from "@/lib/db/client";
import { nextDocumentNumber } from "@/lib/db/numbers";
import { inclusiveVatBreakdown } from "@/lib/tax";
import {
  orderItems,
  orders,
  quoteAccessTokens,
  quoteEvents,
  quoteItems,
  quotes,
} from "@/lib/db/schema";
import { notifyOrderPlaced, notifyQuoteAccepted } from "@/lib/email/notify";
import { customerEmailFromSnapshot } from "@/lib/email/snapshot";
import { expireQuoteIfStale } from "./expire";
import { listQuoteDocuments } from "./documents";
import { assertQuoteTransition, QuoteTransitionError } from "./transitions";

export class QuoteAcceptError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QuoteAcceptError";
  }
}

export async function getQuoteByAccessToken(token: string, identity: CommerceIdentity = { profileId: null, sessionId: null }) {
  if (!z.uuid().safeParse(token).success) return null;
  const db = getDb();
  const [owned] = identity.profileId ? await db.select().from(quotes)
    .where(and(eq(quotes.id, token), documentOwner(quotes, identity))).limit(1) : [];
  const [access] = owned ? [] : await db
    .select({
      quote: quotes,
      token: quoteAccessTokens.token,
    })
    .from(quoteAccessTokens)
    .innerJoin(quotes, eq(quotes.id, quoteAccessTokens.quoteId))
    .where(eq(quoteAccessTokens.token, token))
    .limit(1);

  const row = owned ? { quote: owned, token } : access;
  if (!row || row.quote.status === "draft") {
    return null;
  }

  const quote = (await expireQuoteIfStale(row.quote.id)) ?? row.quote;

  const lines = await db
    .select()
    .from(quoteItems)
    .where(eq(quoteItems.quoteId, quote.id));
  const documents = await listQuoteDocuments(quote.id);

  return { ...quote, lines, documents, token: row.token };
}

export async function acceptQuoteByToken(input: {
  token: string;
  sessionId: string | null;
  profileId?: string | null;
}) {
  const identity = { profileId: input.profileId ?? null, sessionId: input.sessionId };
  const found = await getQuoteByAccessToken(input.token, identity);
  if (!found) {
    throw new QuoteAcceptError("That quotation was not found.");
  }

  if (found.profileId) {
    const [owned] = await getDb().select({ id: quotes.id }).from(quotes)
      .where(and(eq(quotes.id, found.id), documentOwner(quotes, identity))).limit(1);
    if (!identity.profileId || !owned) throw new QuoteAcceptError("Sign in to the account that owns this quotation to accept it.");
  }

  try {
    assertQuoteTransition(found.status, "accepted");
  } catch (error) {
    if (error instanceof QuoteTransitionError) {
      throw new QuoteAcceptError(error.message);
    }
    throw error;
  }

  if (!found.addressSnapshot) {
    throw new QuoteAcceptError("This quotation is missing a delivery address.");
  }
  if (!found.deliveryZoneId) {
    throw new QuoteAcceptError("This quotation is missing a delivery zone.");
  }

  const unpriced = found.lines.find((line) => line.unitPrice === null);
  if (unpriced) {
    throw new QuoteAcceptError("PaperSource has not finished pricing this quotation.");
  }

  const addressSnapshot = found.addressSnapshot;
  const deliveryZoneId = found.deliveryZoneId;
  const sessionId = input.sessionId ?? found.sessionId ?? undefined;
  const nationwide = found.deliveryFeeStatus === "pending_nationwide";
  const orderStatus = nationwide ? "awaiting_terms" : "pending_payment";
  const quoteAfterAccept = nationwide ? "accepted" : "payment_pending";

  if (!nationwide) {
    assertQuoteTransition("accepted", "payment_pending");
  }

  const number = await nextDocumentNumber("order");
  const db = getDb();

  const order = await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(quotes)
      .set({
        status: quoteAfterAccept,
        updatedAt: new Date(),
      })
      .where(and(eq(quotes.id, found.id), eq(quotes.status, "sent")))
      .returning();

    if (!updated) {
      throw new QuoteAcceptError("This quotation is no longer waiting for acceptance.");
    }

    await tx.insert(quoteEvents).values({
      quoteId: found.id,
      fromStatus: "sent",
      toStatus: "accepted",
      actorType: input.profileId ? "customer" : "guest",
      actorId: input.profileId ?? undefined,
      payload: { number },
    });

    if (quoteAfterAccept === "payment_pending") {
      await tx.insert(quoteEvents).values({
        quoteId: found.id,
        fromStatus: "accepted",
        toStatus: "payment_pending",
        actorType: "system",
        payload: { number },
      });
    }

    const [created] = await tx
      .insert(orders)
      .values({
        number,
        source: "quote",
        quoteId: found.id,
        profileId: found.profileId,
        organizationId: found.organizationId ?? undefined,
        sessionId,
        status: orderStatus,
        goodsTotal: found.goodsTotal,
        taxTotal: found.taxTotal,
        taxJson: found.taxJson,
        deliveryFee: found.deliveryFee,
        deliveryFeeStatus: found.deliveryFeeStatus,
        grandTotal: found.grandTotal,
        addressSnapshot,
        deliveryZoneId,
        notes: found.notes,
      })
      .returning();

    if (!created) {
      throw new QuoteAcceptError("Could not create the order from this quotation.");
    }

    await tx.insert(orderItems).values(
      found.lines.map((line) => {
        const unitPrice = line.unitPrice ?? 0;
        const lineTotal = line.lineTotal ?? unitPrice * line.quantity;
        return {
          orderId: created.id,
          variantId: line.variantId,
          nameSnapshot: line.nameSnapshot,
          skuSnapshot: line.skuSnapshot,
          specSnapshot: line.specSnapshot,
          quantity: line.quantity,
          unitPrice,
          lineTotal,
          taxTotal: inclusiveVatBreakdown(lineTotal).taxTotal,
        };
      }),
    );

    return created;
  });

  const email =
    found.guestEmail ?? customerEmailFromSnapshot(found.addressSnapshot);
  await notifyQuoteAccepted({
    quoteId: found.id,
    quoteNumber: found.number ?? found.id,
    orderNumber: order.number,
    email,
    contactName: found.contactName,
  });
  await notifyOrderPlaced({
    orderId: order.id,
    orderNumber: order.number,
    source: "quote",
    email,
    contactName: found.contactName ?? found.addressSnapshot?.fullName,
    grandTotalPesewas: found.grandTotal,
    nationwide,
  });

  return { orderNumber: order.number, quoteStatus: quoteAfterAccept };
}
