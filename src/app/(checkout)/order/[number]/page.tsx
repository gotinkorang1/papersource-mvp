import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Script from "next/script";
import { and, eq } from "drizzle-orm";
import { PayNowButton } from "@/components/checkout/pay-now-button";
import { fulfillSuccessfulPayment } from "@/features/payments/fulfill";
import { verifyPaystackTransaction } from "@/lib/paystack/client";
import { formatGhs } from "@/lib/money";
import { getDb, isDatabaseConfigured } from "@/lib/db/client";
import { deliveryZones, orderItems, orders, productVariants } from "@/lib/db/schema";
import type { AddressSnapshot } from "@/lib/db/schema/identity";
import { readCommerceIdentity } from "@/lib/customer/commerce";
import { documentOwner } from "@/lib/customer/commerce-identity";
import { OrderStatusTimeline } from "@/components/orders/order-status-timeline";
import { PrintReceiptButton } from "@/components/orders/print-receipt-button";
import { getStoreSettings } from "@/features/settings/admin";
import { PurchaseAnalytics } from "@/components/analytics/purchase-analytics";

export const metadata: Metadata = {
  title: "Order received",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ number: string }>;
  searchParams: Promise<{ reference?: string; trxref?: string }>;
};

function estimatedDeliveryDate(createdAt: Date, maximumDays: number) {
  const date = new Date(createdAt);
  date.setUTCDate(date.getUTCDate() + Math.max(1, maximumDays));
  return date.toISOString().slice(0, 10);
}

function GoogleCustomerReviewsOptIn({
  orderId,
  email,
  estimatedDeliveryDate: deliveryDate,
  gtins,
}: {
  orderId: string;
  email: string;
  estimatedDeliveryDate: string;
  gtins: string[];
}) {
  const payload = JSON.stringify({
    merchant_id: 5859106353,
    order_id: orderId,
    email,
    delivery_country: "GH",
    estimated_delivery_date: deliveryDate,
    ...(gtins.length ? { products: gtins.map((gtin) => ({ gtin })) } : {}),
  })
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("&", "\\u0026");

  return (
    <>
      <Script id="google-customer-reviews-opt-in" strategy="afterInteractive">
        {`window.renderOptIn = function() {
  window.gapi.load("surveyoptin", function() {
    window.gapi.surveyoptin.render(${payload});
  });
};`}
      </Script>
      <Script
        id="google-customer-reviews-platform"
        src="https://apis.google.com/js/platform.js?onload=renderOptIn"
        strategy="afterInteractive"
      />
    </>
  );
}

export default async function OrderPage({ params, searchParams }: PageProps) {
  if (!isDatabaseConfigured()) {
    notFound();
  }

  const { number } = await params;
  const query = await searchParams;
  const identity = await readCommerceIdentity();
  if (!identity.profileId && !identity.sessionId) {
    notFound();
  }

  const db = getDb();
  const [found] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.number, number), documentOwner(orders, identity)))
    .limit(1);

  if (!found) {
    notFound();
  }

  const returnReference = query.reference ?? query.trxref;
  const settings = await getStoreSettings();
  if (
    returnReference &&
    settings.paymentMode === "live" &&
    found.status === "pending_payment"
  ) {
    const verified = await verifyPaystackTransaction(returnReference, settings.paymentMode);
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
    .where(and(eq(orders.number, number), documentOwner(orders, identity)))
    .limit(1);

  if (!order) {
    notFound();
  }

  const address = order.addressSnapshot as AddressSnapshot;
  const [deliveryZone, itemRows] = await Promise.all([
    db
      .select({ estimatedMaxDays: deliveryZones.estimatedMaxDays })
      .from(deliveryZones)
      .where(eq(deliveryZones.id, order.deliveryZoneId))
      .limit(1),
    db
      .select({
        id: orderItems.variantId,
        name: orderItems.nameSnapshot,
        quantity: orderItems.quantity,
        unitPrice: orderItems.unitPrice,
        barcode: productVariants.barcode,
      })
      .from(orderItems)
      .leftJoin(productVariants, eq(orderItems.variantId, productVariants.id))
      .where(eq(orderItems.orderId, order.id)),
  ]);
  const googleCustomerReviews =
    order.source === "cart" &&
    order.status === "paid" &&
    Boolean(address.email) &&
    order.deliveryFeeStatus !== "pending_nationwide"
      ? {
          email: address.email,
          estimatedDeliveryDate: estimatedDeliveryDate(
            order.createdAt,
            deliveryZone[0]?.estimatedMaxDays ?? 2,
          ),
          gtins: [...new Set(
            itemRows
              .map((item) => item.barcode)
              .filter((barcode): barcode is string => Boolean(barcode && /^(?:\d{8}|\d{12,14})$/.test(barcode))),
          )],
        }
      : null;

  const nationwide = order.deliveryFeeStatus === "pending_nationwide";
  const pickup = typeof order.addressSnapshot === "object" && order.addressSnapshot !== null && "deliveryArea" in order.addressSnapshot && order.addressSnapshot.deliveryArea === "pickup";
  const awaitingPaystack = order.status === "pending_payment" && !nationwide;
  const confirming =
    Boolean(returnReference) && order.status === "pending_payment" && settings.paymentMode === "live";
  const purchaseItems = itemRows.map((item) => ({
    id: item.id ?? item.name,
    name: item.name,
    quantity: item.quantity,
    unitPricePesewas: item.unitPrice,
  }));

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
          : pickup
            ? "Your order is recorded. We will contact you when it is ready for collection at the PaperSource shop."
            : confirming
              ? "Confirming payment… Mobile Money can complete after you leave Paystack. This page does not mark the order paid from the URL."
              : "Your order is recorded. Payment has not been taken yet — Paystack card and MoMo will charge this pending total."}
      </p>
      <OrderStatusTimeline status={order.status} />
      {order.status === "paid" ? <PurchaseAnalytics transactionId={order.number} valuePesewas={order.grandTotal} taxPesewas={order.taxTotal} shippingPesewas={order.deliveryFee} items={purchaseItems} /> : null}
      <div className="mt-6 print:hidden">
        <PrintReceiptButton />
      </div>
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
            {pickup ? "Shop pickup · Free" : nationwide ? "To be confirmed" : formatGhs(order.deliveryFee)}
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
      {googleCustomerReviews ? (
        <GoogleCustomerReviewsOptIn
          orderId={order.number}
          email={googleCustomerReviews.email}
          estimatedDeliveryDate={googleCustomerReviews.estimatedDeliveryDate}
          gtins={googleCustomerReviews.gtins}
        />
      ) : null}
      <p className="mt-8">
        <Link href="/shop" className="underline">
          Continue shopping
        </Link>
      </p>
    </main>
  );
}
