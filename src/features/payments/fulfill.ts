import { eq, sql } from "drizzle-orm";
import { clearCart } from "@/features/cart/repository";
import { assertPaystackAmountMatches } from "@/lib/paystack/amount";
import { getDb } from "@/lib/db/client";
import {
  inventory,
  inventoryMovements,
  orderItems,
  orders,
  payments,
  quoteEvents,
  quotes,
} from "@/lib/db/schema";
import { canTransitionQuote } from "@/features/quotations/transitions";
import { notifyPaymentConfirmed } from "@/lib/email/notify";
import { customerEmailFromSnapshot } from "@/lib/email/snapshot";
import type { AddressSnapshot } from "@/lib/db/schema/identity";

export async function fulfillSuccessfulPayment(input: {
  reference: string;
  amount: number;
  currency?: string;
}) {
  const db = getDb();
  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.paystackReference, input.reference))
    .limit(1);

  if (!payment) {
    throw new Error("No payment matches that Paystack reference.");
  }

  if (input.currency && input.currency !== payment.currency) {
    throw new Error("Paystack currency does not match the payment.");
  }

  assertPaystackAmountMatches(input.amount, payment.amount);

  if (payment.status === "success") {
    return { orderId: payment.orderId, alreadyPaid: true };
  }

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, payment.orderId))
    .limit(1);

  if (!order) {
    throw new Error("The order for this payment is missing.");
  }

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id));

  let paidNow = false;
  await db.transaction(async (tx) => {
    const [locked] = await tx
      .select()
      .from(payments)
      .where(eq(payments.id, payment.id))
      .limit(1);
    if (!locked || locked.status === "success") {
      return;
    }

    await tx
      .update(payments)
      .set({ status: "success", updatedAt: new Date() })
      .where(eq(payments.id, payment.id));

    await tx
      .update(orders)
      .set({ status: "paid", updatedAt: new Date() })
      .where(eq(orders.id, order.id));

    if (order.quoteId) {
      const [quote] = await tx
        .select()
        .from(quotes)
        .where(eq(quotes.id, order.quoteId))
        .limit(1);
      if (quote && canTransitionQuote(quote.status, "paid")) {
        await tx
          .update(quotes)
          .set({ status: "paid", updatedAt: new Date() })
          .where(eq(quotes.id, quote.id));
        await tx.insert(quoteEvents).values({
          quoteId: quote.id,
          fromStatus: quote.status,
          toStatus: "paid",
          actorType: "system",
          payload: { orderId: order.id },
        });
        if (canTransitionQuote("paid", "order_created")) {
          await tx
            .update(quotes)
            .set({ status: "order_created", updatedAt: new Date() })
            .where(eq(quotes.id, quote.id));
          await tx.insert(quoteEvents).values({
            quoteId: quote.id,
            fromStatus: "paid",
            toStatus: "order_created",
            actorType: "system",
            payload: { orderId: order.id },
          });
        }
      }
    }

    for (const item of items) {
      if (!item.variantId) {
        continue;
      }

      await tx
        .update(inventory)
        .set({
          onHand: sql`${inventory.onHand} - ${item.quantity}`,
        })
        .where(eq(inventory.variantId, item.variantId));

      await tx.insert(inventoryMovements).values({
        variantId: item.variantId,
        delta: -item.quantity,
        reason: "fulfil",
        referenceType: "order",
        referenceId: order.id,
      });
    }

    paidNow = true;
  });

  if ((order.profileId || order.sessionId) && order.source === "cart") {
    await clearCart({ profileId: order.profileId, sessionId: order.sessionId });
  }

  if (paidNow) {
    const snapshot = order.addressSnapshot as AddressSnapshot | null;
    await notifyPaymentConfirmed({
      orderId: order.id,
      orderNumber: order.number,
      email: customerEmailFromSnapshot(snapshot),
      contactName: snapshot?.fullName,
      grandTotalPesewas: order.grandTotal,
    });
  }

  return { orderId: order.id, alreadyPaid: !paidNow };
}
