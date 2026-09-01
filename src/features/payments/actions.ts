"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { initializeOrderPayment, PaymentError } from "@/features/payments/initialize";
import { processPaystackWebhook } from "@/features/payments/webhook";
import { isLivePaystack, signPaystackBody } from "@/lib/paystack/signature";
import { getDb } from "@/lib/db/client";
import { orders, payments } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { readCommerceIdentity } from "@/lib/customer/commerce";
import { documentOwner } from "@/lib/customer/commerce-identity";

export async function startPaystackPaymentAction(
  _prev: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  const identity = await readCommerceIdentity();
  if (!identity.profileId && !identity.sessionId) {
    return { error: "Your session expired. Open the order from this browser." };
  }

  let authorizationUrl: string;
  try {
    const orderId = z.string().uuid().parse(formData.get("orderId"));
    const result = await initializeOrderPayment({ orderId, ...identity });
    authorizationUrl = result.authorizationUrl;
  } catch (error) {
    if (error instanceof PaymentError) {
      return { error: error.message };
    }
    if (error instanceof z.ZodError) {
      return { error: "That order could not be paid." };
    }
    throw error;
  }
  redirect(authorizationUrl);
}

export async function simulateMockPaystackSuccessAction(formData: FormData) {
  if (isLivePaystack()) {
    throw new Error("Mock Paystack is disabled when live keys are configured.");
  }

  const reference = z.string().min(8).parse(formData.get("reference"));
  const identity = await readCommerceIdentity();
  const db = getDb();
  const [row] = await db
    .select({
      amount: payments.amount,
      currency: payments.currency,
      number: orders.number,
      sessionId: orders.sessionId,
    })
    .from(payments)
    .innerJoin(orders, eq(orders.id, payments.orderId))
    .where(and(eq(payments.paystackReference, reference), documentOwner(orders, identity)))
    .limit(1);

  if (!row) {
    throw new Error("That mock payment was not found.");
  }


  const raw = JSON.stringify({
    event: "charge.success",
    data: {
      id: `mock_${reference}`,
      status: "success",
      reference,
      amount: row.amount,
      currency: row.currency,
    },
  });
  await processPaystackWebhook(raw, signPaystackBody(raw));
  redirect(`/order/${row.number}`);
}
