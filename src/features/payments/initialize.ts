import { and, eq, inArray } from "drizzle-orm";
import { initializePaystackTransaction } from "@/lib/paystack/client";
import { pesewasToPaystackAmount } from "@/lib/paystack/amount";
import { publicEnv } from "@/lib/env";
import { getDb } from "@/lib/db/client";
import { orders, payments } from "@/lib/db/schema";
import type { AddressSnapshot } from "@/lib/db/schema/identity";

export class PaymentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaymentError";
  }
}

const OPEN_STATUSES = ["initialized", "pending"] as const;

function siteUrl() {
  return publicEnv.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export async function initializeOrderPayment(input: {
  orderId: string;
  sessionId: string;
}) {
  const db = getDb();
  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, input.orderId), eq(orders.sessionId, input.sessionId)))
    .limit(1);

  if (!order) {
    throw new PaymentError("That order was not found.");
  }

  if (order.status !== "pending_payment") {
    throw new PaymentError("This order is not ready for Paystack yet.");
  }

  if (order.deliveryFeeStatus === "pending_nationwide") {
    throw new PaymentError(
      "Nationwide delivery must be confirmed before payment is taken.",
    );
  }

  const address = order.addressSnapshot as AddressSnapshot;
  if (!address.email) {
    throw new PaymentError("Email is required to start Paystack.");
  }

  const amount = pesewasToPaystackAmount(order.grandTotal);

  const [open] = await db
    .select()
    .from(payments)
    .where(
      and(
        eq(payments.orderId, order.id),
        inArray(payments.status, [...OPEN_STATUSES]),
      ),
    )
    .limit(1);

  const reference = open?.paystackReference ?? `ps_${order.number}_${crypto.randomUUID()}`;
  const callbackUrl = `${siteUrl()}/order/${order.number}`;
  const init = await initializePaystackTransaction({
    email: address.email,
    amountPesewas: amount,
    reference,
    callbackUrl,
  });

  if (open) {
    await db
      .update(payments)
      .set({
        amount,
        authorizationUrl: init.authorizationUrl,
        paystackReference: init.reference,
        rawInit: init.raw,
        updatedAt: new Date(),
      })
      .where(eq(payments.id, open.id));
  } else {
    await db.insert(payments).values({
      orderId: order.id,
      provider: "paystack",
      status: "initialized",
      amount,
      paystackReference: init.reference,
      authorizationUrl: init.authorizationUrl,
      rawInit: init.raw,
    });
  }

  return { authorizationUrl: init.authorizationUrl, reference: init.reference };
}
