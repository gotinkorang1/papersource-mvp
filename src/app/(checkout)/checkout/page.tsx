import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { paperButton } from "@/components/commerce/paper-button";
import { listCustomerAddresses } from "@/features/account/addresses";
import { listCartLines } from "@/features/cart/repository";
import { formatGhs } from "@/lib/money";
import { readCustomerActor } from "@/lib/customer/require";
import { isDatabaseConfigured } from "@/lib/db/client";
import { readCommerceIdentity } from "@/lib/customer/commerce";
import { getStorefrontDeliveryBadge } from "@/features/delivery/queries";
import { CheckoutAnalytics } from "@/components/analytics/checkout-analytics";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: true },
};

export default async function CheckoutPage() {
  const sessionId = isDatabaseConfigured() ? await readCommerceIdentity() : null;
  const customer = isDatabaseConfigured() ? await readCustomerActor() : null;
  const saved = customer ? await listCustomerAddresses(customer.profileId) : [];
  const preferred = saved.find((row) => row.isDefault) ?? saved[0];
  const deliveryBadge = await getStorefrontDeliveryBadge();
  const lines = sessionId ? await listCartLines(sessionId) : [];
  const goods = lines.reduce(
    (sum, line) => sum + line.unitPricePesewas * line.quantity,
    0,
  );

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 md:py-16 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-paper-green">Secure checkout</p>
      <h1 className="mt-3 font-heading text-4xl font-semibold tracking-tight text-ink md:text-5xl">Complete your order</h1>
      <p className="mt-3 max-w-3xl text-slate">
        Ghana delivery or shop pickup. Prices are confirmed on the server. {deliveryBadge.label}.
        Accra and Tema orders can pay with Paystack after the order is recorded.
        Nationwide orders wait for delivery terms — no fee is invented here.
      </p>
      {lines.length === 0 ? (
        <div className="mt-6 space-y-4">
          <p className="text-slate">Add items to your cart before placing an order.</p>
          <Link href="/cart" className={paperButton({ variant: "secondary" })}>Return to cart</Link>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-border rounded-2xl border border-border bg-card px-4 text-sm shadow-sm sm:px-6">
          {lines.map((line) => (
            <li key={line.id} className="flex justify-between gap-4 py-3">
              <span>
                {line.name} × {line.quantity}
              </span>
              <span className="tabular-nums">
                {formatGhs(line.unitPricePesewas * line.quantity)}
              </span>
            </li>
          ))}
          <li className="flex justify-between py-4 font-semibold text-ink">
            <span>Goods (VAT inclusive)</span>
            <span className="tabular-nums">{formatGhs(goods)}</span>
          </li>
        </ul>
      )}
      {lines.length > 0 ? (
        <div className="mt-8">
          <CheckoutAnalytics lines={lines.map((line) => ({ id: line.id, name: line.name, quantity: line.quantity, unitPricePesewas: line.unitPricePesewas }))} />
          <CheckoutForm
            defaultEmail={customer?.email}
            defaultAddress={
              preferred
                ? {
                    fullName: preferred.fullName,
                    phone: preferred.phone,
                    region: preferred.region,
                    cityTown: preferred.cityTown,
                    areaSuburb: preferred.areaSuburb ?? "",
                    streetLandmark: preferred.streetLandmark ?? "",
                    ghanapostGps: preferred.ghanapostGps ?? "",
                    deliveryInstructions: preferred.deliveryInstructions ?? "",
                    deliveryArea:
                      preferred.deliveryArea === "tema" || preferred.deliveryArea === "other"
                        ? preferred.deliveryArea
                        : "accra",
                  }
                : customer
                  ? { fullName: customer.fullName, phone: customer.phone ?? "" }
                  : undefined
            }
            savedAddresses={saved.map((address) => ({ id: address.id, label: `${address.fullName} · ${address.cityTown}`, values: { fullName: address.fullName, phone: address.phone, region: address.region, cityTown: address.cityTown, areaSuburb: address.areaSuburb ?? "", streetLandmark: address.streetLandmark ?? "", ghanapostGps: address.ghanapostGps ?? "", deliveryInstructions: address.deliveryInstructions ?? "", deliveryArea: address.deliveryArea === "tema" || address.deliveryArea === "other" ? address.deliveryArea : "accra" } }))}
            allowPickup
          />
        </div>
      ) : null}
    </main>
  );
}
