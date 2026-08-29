import { eq } from "drizzle-orm";
import { fulfillSuccessfulPayment } from "@/features/payments/fulfill";
import { QuoteAdminError } from "@/features/quotations/admin";
import { getDb } from "@/lib/db/client";
import { orders, payments, quotes } from "@/lib/db/schema";
import { canConfirmQuoteTerms } from "@/lib/staff/rbac";
import type { StaffRole } from "@/lib/staff/types";

const TERMS_PROVIDERS = ["bank_transfer", "purchase_order", "invoice_terms"] as const;
export type TermsProvider = (typeof TERMS_PROVIDERS)[number];

export async function confirmQuoteTerms(input: {
  role: StaffRole;
  actorId: string;
  quoteId: string;
  provider: string;
  note?: string;
}) {
  if (!canConfirmQuoteTerms(input.role)) {
    throw new QuoteAdminError("This role cannot confirm payment terms.");
  }
  if (!TERMS_PROVIDERS.includes(input.provider as TermsProvider)) {
    throw new QuoteAdminError("Choose bank transfer, purchase order, or invoice terms.");
  }
  const provider = input.provider as TermsProvider;

  const db = getDb();
  const [quote] = await db
    .select()
    .from(quotes)
    .where(eq(quotes.id, input.quoteId))
    .limit(1);
  if (!quote) {
    throw new QuoteAdminError("That quotation was not found.");
  }
  if (quote.status !== "accepted" && quote.status !== "payment_pending") {
    throw new QuoteAdminError("Confirm terms after the customer has accepted.");
  }

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.quoteId, quote.id))
    .limit(1);
  if (!order) {
    throw new QuoteAdminError("Accept the quotation before recording terms.");
  }
  if (order.status === "paid") {
    throw new QuoteAdminError("This order is already settled.");
  }

  const reference = `terms_${quote.id}`;
  const [existing] = await db
    .select()
    .from(payments)
    .where(eq(payments.paystackReference, reference))
    .limit(1);

  if (!existing) {
    await db.insert(payments).values({
      orderId: order.id,
      provider,
      status: "initialized",
      amount: order.grandTotal,
      currency: "GHS",
      paystackReference: reference,
      rawInit: {
        terms: true,
        actorId: input.actorId,
        note: input.note ?? null,
      },
    });
  }

  await fulfillSuccessfulPayment({
    reference,
    amount: order.grandTotal,
    currency: "GHS",
  });
}
