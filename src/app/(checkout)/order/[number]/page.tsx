import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { PayNowButton } from "@/components/checkout/pay-now-button";
import { fulfillSuccessfulPayment } from "@/features/payments/fulfill";
import { verifyPaystackTransaction } from "@/lib/paystack/client";
import { isLivePaystack } from "@/lib/paystack/signature";
import { formatGhs } from "@/lib/money";
import { getDb, isDatabaseConfigured } from "@/lib/db/client";
import { orders } from "@/lib/db/schema";
import { readGuestSessionId } from "@/lib/session/guest";

export const metadata: Metadata = {
  title: "Order received",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ number: string }>;
  searchParams: Promise<{ reference?: string; trxref?: string }>;
};

export default async function OrderPage({ params, searchParams }: PageProps) {
  if (!isDatabaseConfigured()) {
    notFound();
  }

  const { number } = await params;
  const query = await searchParams;
  const sessionId = await readGuestSessionId();
  if (!sessionId) {
    notFound();
  }

  const db = getDb();
  const [found] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.number, number), eq(orders.sessionId, sessionId)))
    .limit(1);

  if (!found) {
    notFound();
  }

  const returnReference = query.reference ?? query.trxref;
  if (
    returnReference &&
    isLivePaystack() &&
    found.status === "pending_payment"
  ) {
    const verified = await verifyPaystackTransaction(returnReference);
    if (verified.status === "success") {
      await fulfillSuccessfulPayment({
        reference: verified.reference,
        amount: verified.amount,
        currency: verified.currency,
      });
    }
  }

  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.number, number), eq(orders.sessionId, sessionId)))
    .limit(1);

  if (!order) {
    notFound();
  }

  const nationwide = order.deliveryFeeStatus === "pending_nationwide";
  const awaitingPaystack = order.status === "pending_payment" && !nationwide;
  const confirming =
    Boolean(returnReference) && order.status === "pending_payment" && isLivePaystack();

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-sm tracking-[0.16em] text-slate uppercase">
        {order.source === "quote" ? "Quote order" : "Retail order"}
      </p>
      <h1 className="mt-2 text-3xl text-ink">Order {order.number}</h1>
      <p className="mt-4 text-slate">
        {order.status === "paid"
          ? "Payment is confirmed. Paystack card or MoMo was verified on the server."
          : nationwide
            ? "We'll contact you to confirm nationwide delivery before any payment is taken. No delivery fee was invented at checkout."
            : confirming
              ? "Confirming payment… Mobile Money can complete after you leave Paystack. This page does not mark the order paid from the URL."
              : "Your order is recorded. Payment has not been taken yet — Paystack card and MoMo will charge this pending total."}
      </p>
      <dl className="mt-8 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate">Status</dt>
          <dd className="text-ink">{order.status.replaceAll("_", " ")}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate">Goods</dt>
          <dd className="tabular-nums text-ink">{formatGhs(order.goodsTotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate">Delivery</dt>
          <dd className="tabular-nums text-ink">
            {nationwide ? "To be confirmed" : formatGhs(order.deliveryFee)}
          </dd>
        </div>
        <div className="flex justify-between font-medium">
          <dt>Total</dt>
          <dd className="tabular-nums">{formatGhs(order.grandTotal)}</dd>
        </div>
      </dl>
      {awaitingPaystack ? (
        <div className="mt-8">
          <PayNowButton orderId={order.id} />
        </div>
      ) : null}
      <p className="mt-8">
        <Link href="/shop" className="underline">
          Continue shopping
        </Link>
      </p>
    </main>
  );
}
