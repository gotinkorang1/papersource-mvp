import { eq } from "drizzle-orm";
import { fulfillSuccessfulPayment } from "@/features/payments/fulfill";
import { paystackSignatureValid } from "@/lib/paystack/signature";
import { verifyPaystackTransaction } from "@/lib/paystack/client";
import { getDb } from "@/lib/db/client";
import { getStoreSettings } from "@/features/settings/admin";
import { paymentEvents, payments } from "@/lib/db/schema";

export class WebhookSignatureError extends Error {
  constructor() {
    super("Invalid Paystack signature");
    this.name = "WebhookSignatureError";
  }
}

export class WebhookPayloadError extends Error {
  constructor() {
    super("Invalid Paystack webhook payload");
    this.name = "WebhookPayloadError";
  }
}

export async function processPaystackWebhook(rawBody: string, signature: string) {
  if (!paystackSignatureValid(rawBody, signature)) {
    throw new WebhookSignatureError();
  }

  let event: {
    event?: string;
    data?: {
      id?: number | string;
      status?: string;
      reference?: string;
      amount?: number;
      currency?: string;
    };
  };
  try {
    event = JSON.parse(rawBody) as typeof event;
  } catch {
    throw new WebhookPayloadError();
  }

  if (event.event !== "charge.success" || !event.data?.reference) {
    return { ignored: true as const };
  }

  const db = getDb();
  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.paystackReference, event.data.reference))
    .limit(1);

  if (!payment) {
    return { ignored: true as const };
  }

  const settings = await getStoreSettings();
  if (settings.paymentMode === "live") {
    const verified = await verifyPaystackTransaction(event.data.reference, settings.paymentMode);
    if (verified.status !== "success") {
      return { pending: true as const };
    }
    await fulfillSuccessfulPayment({
      reference: verified.reference,
      amount: verified.amount,
      currency: verified.currency,
    });
  } else {
    await fulfillSuccessfulPayment({
      reference: event.data.reference,
      amount: event.data.amount ?? 0,
      currency: event.data.currency,
    });
  }

  const providerEventId = String(event.data.id ?? `${event.event}:${event.data.reference}`);
  const inserted = await db
    .insert(paymentEvents)
    .values({ paymentId: payment.id, providerEventId, eventType: event.event, payload: event })
    .onConflictDoNothing()
    .returning();
  if (inserted.length === 0) return { duplicate: true as const };
  return { paid: true as const };
}
