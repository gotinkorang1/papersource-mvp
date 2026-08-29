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
} from "@/lib/db/schema";

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
  });

  if (order.sessionId) {
    await clearCart(order.sessionId);
  }

  return { orderId: order.id, alreadyPaid: false };
}
