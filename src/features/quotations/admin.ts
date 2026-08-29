import { and, asc, desc, eq, ne } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { inclusiveVatBreakdown } from "@/lib/tax";
import { parseGhsToPesewas } from "@/lib/money";
import {
  organizations,
  quoteAccessTokens,
  quoteEvents,
  quoteItems,
  quotes,
} from "@/lib/db/schema";
import type { QuoteStatus } from "@/lib/db/schema";
import type { StaffRole } from "@/lib/staff/types";
import { canAccessAdmin } from "@/lib/staff/rbac";
import { assertQuoteTransition, QuoteTransitionError } from "./transitions";

export class QuoteAdminError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QuoteAdminError";
  }
}

const DEFAULT_EXPIRY_DAYS = 14;

function assertSalesWrite(role: StaffRole) {
  if (!canAccessAdmin(role, "quotes", "write")) {
    throw new QuoteAdminError("This role cannot change quotations.");
  }
}

function assertQuotesRead(role: StaffRole) {
  if (!canAccessAdmin(role, "quotes", "read")) {
    throw new QuoteAdminError("This role cannot view quotations.");
  }
}

export async function listSubmittedQuotes(role: StaffRole) {
  assertQuotesRead(role);
  const db = getDb();
  return db
    .select({
      id: quotes.id,
      number: quotes.number,
      status: quotes.status,
      contactName: quotes.contactName,
      guestEmail: quotes.guestEmail,
      grandTotal: quotes.grandTotal,
      updatedAt: quotes.updatedAt,
      organizationName: organizations.name,
    })
    .from(quotes)
    .leftJoin(organizations, eq(organizations.id, quotes.organizationId))
    .where(ne(quotes.status, "draft"))
    .orderBy(desc(quotes.updatedAt));
}

export async function getQuoteForAdmin(role: StaffRole, quoteId: string) {
  assertQuotesRead(role);
  const db = getDb();
  const [quote] = await db
    .select({
      quote: quotes,
      organizationName: organizations.name,
    })
    .from(quotes)
    .leftJoin(organizations, eq(organizations.id, quotes.organizationId))
    .where(eq(quotes.id, quoteId))
    .limit(1);

  if (!quote || quote.quote.status === "draft") {
    return null;
  }

  const lines = await db
    .select()
    .from(quoteItems)
    .where(eq(quoteItems.quoteId, quote.quote.id));
  const events = await db
    .select()
    .from(quoteEvents)
    .where(eq(quoteEvents.quoteId, quote.quote.id))
    .orderBy(asc(quoteEvents.createdAt));
  const [access] = await db
    .select()
    .from(quoteAccessTokens)
    .where(eq(quoteAccessTokens.quoteId, quote.quote.id))
    .limit(1);

  return {
    ...quote.quote,
    organizationName: quote.organizationName,
    lines,
    events,
    customerToken: access?.token ?? null,
  };
}

async function transitionQuote(input: {
  quoteId: string;
  from: QuoteStatus;
  to: QuoteStatus;
  actorId: string;
  payload?: Record<string, unknown>;
}) {
  try {
    assertQuoteTransition(input.from, input.to);
  } catch (error) {
    if (error instanceof QuoteTransitionError) {
      throw new QuoteAdminError(error.message);
    }
    throw error;
  }

  const db = getDb();
  await db.transaction(async (tx) => {
    await tx
      .update(quotes)
      .set({
        status: input.to,
        updatedAt: new Date(),
        ...(input.to === "sent"
          ? {
              expiresAt: new Date(
                Date.now() + DEFAULT_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
              ),
            }
          : {}),
      })
      .where(and(eq(quotes.id, input.quoteId), eq(quotes.status, input.from)));

    await tx.insert(quoteEvents).values({
      quoteId: input.quoteId,
      fromStatus: input.from,
      toStatus: input.to,
      actorType: "admin",
      actorId: input.actorId,
      payload: input.payload ?? null,
    });
  });
}

export async function startQuoteReview(input: {
  role: StaffRole;
  actorId: string;
  quoteId: string;
}) {
  assertSalesWrite(input.role);
  const db = getDb();
  const [quote] = await db
    .select()
    .from(quotes)
    .where(eq(quotes.id, input.quoteId))
    .limit(1);
  if (!quote) {
    throw new QuoteAdminError("That quotation was not found.");
  }
  await transitionQuote({
    quoteId: quote.id,
    from: quote.status,
    to: "under_review",
    actorId: input.actorId,
  });
}

export async function saveQuotePrices(input: {
  role: StaffRole;
  actorId: string;
  quoteId: string;
  linePrices: { lineId: string; unitPricePesewas: number }[];
  deliveryFeePesewas: number | null;
}) {
  assertSalesWrite(input.role);
  const db = getDb();
  const [quote] = await db
    .select()
    .from(quotes)
    .where(eq(quotes.id, input.quoteId))
    .limit(1);
  if (!quote) {
    throw new QuoteAdminError("That quotation was not found.");
  }
  if (quote.status !== "under_review" && quote.status !== "priced") {
    throw new QuoteAdminError("Price lines while the quote is under review.");
  }

  const lines = await db
    .select()
    .from(quoteItems)
    .where(eq(quoteItems.quoteId, quote.id));
  const priceByLine = new Map(
    input.linePrices.map((line) => [line.lineId, line.unitPricePesewas]),
  );

  let goodsTotal = 0;
  const priced = lines.map((line) => {
    const unitPrice = priceByLine.get(line.id) ?? line.unitPrice;
    if (unitPrice === null) {
      throw new QuoteAdminError(`${line.nameSnapshot} still needs a unit price.`);
    }
    if (!Number.isInteger(unitPrice) || unitPrice < 0) {
      throw new QuoteAdminError("Unit prices must be integer pesewas.");
    }
    const lineTotal = unitPrice * line.quantity;
    goodsTotal += lineTotal;
    return { id: line.id, unitPrice, lineTotal };
  });

  const deliveryFee =
    input.deliveryFeePesewas === null ? quote.deliveryFee : input.deliveryFeePesewas;
  if (!Number.isInteger(deliveryFee) || deliveryFee < 0) {
    throw new QuoteAdminError("Delivery fee must be integer pesewas.");
  }
  const deliveryFeeStatus =
    deliveryFee > 0 || quote.deliveryFeeStatus === "waived"
      ? ("calculated" as const)
      : quote.deliveryFeeStatus;
  const tax = inclusiveVatBreakdown(goodsTotal + deliveryFee);

  const nextStatus: QuoteStatus = "priced";
  try {
    if (quote.status !== nextStatus) {
      assertQuoteTransition(quote.status, nextStatus);
    }
  } catch (error) {
    if (error instanceof QuoteTransitionError) {
      throw new QuoteAdminError(error.message);
    }
    throw error;
  }

  await db.transaction(async (tx) => {
    for (const line of priced) {
      await tx
        .update(quoteItems)
        .set({ unitPrice: line.unitPrice, lineTotal: line.lineTotal })
        .where(eq(quoteItems.id, line.id));
    }

    await tx
      .update(quotes)
      .set({
        status: nextStatus,
        goodsTotal,
        taxTotal: tax.taxTotal,
        taxJson: tax.taxJson,
        deliveryFee,
        deliveryFeeStatus,
        grandTotal: goodsTotal + deliveryFee,
        updatedAt: new Date(),
      })
      .where(eq(quotes.id, quote.id));

    if (quote.status !== nextStatus) {
      await tx.insert(quoteEvents).values({
        quoteId: quote.id,
        fromStatus: quote.status,
        toStatus: nextStatus,
        actorType: "admin",
        actorId: input.actorId,
        payload: { goodsTotal, deliveryFee },
      });
    }
  });
}

export async function sendQuote(input: {
  role: StaffRole;
  actorId: string;
  quoteId: string;
}) {
  assertSalesWrite(input.role);
  const db = getDb();
  const [quote] = await db
    .select()
    .from(quotes)
    .where(eq(quotes.id, input.quoteId))
    .limit(1);
  if (!quote) {
    throw new QuoteAdminError("That quotation was not found.");
  }
  if (quote.grandTotal <= 0) {
    throw new QuoteAdminError("Set prices before sending this quotation.");
  }
  await transitionQuote({
    quoteId: quote.id,
    from: quote.status,
    to: "sent",
    actorId: input.actorId,
  });
}

export async function declineQuote(input: {
  role: StaffRole;
  actorId: string;
  quoteId: string;
}) {
  assertSalesWrite(input.role);
  const db = getDb();
  const [quote] = await db
    .select()
    .from(quotes)
    .where(eq(quotes.id, input.quoteId))
    .limit(1);
  if (!quote) {
    throw new QuoteAdminError("That quotation was not found.");
  }
  await transitionQuote({
    quoteId: quote.id,
    from: quote.status,
    to: "declined",
    actorId: input.actorId,
  });
}

export function parseLinePrices(formData: FormData) {
  const linePrices: { lineId: string; unitPricePesewas: number }[] = [];
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("price:") || typeof value !== "string") {
      continue;
    }
    const lineId = key.slice("price:".length);
    linePrices.push({
      lineId,
      unitPricePesewas: parseGhsToPesewas(value),
    });
  }
  return linePrices;
}

export function parseOptionalDeliveryFee(formData: FormData) {
  const raw = String(formData.get("deliveryFee") ?? "").trim();
  if (!raw) {
    return null;
  }
  return parseGhsToPesewas(raw);
}
