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
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl text-ink">Checkout</h1>
      <p className="mt-3 text-slate">
        Ghana delivery. Prices are confirmed on the server. {deliveryBadge.label}.
        Accra and Tema orders can pay with Paystack after the order is recorded.
        Nationwide orders wait for delivery terms — no fee is invented here.
      </p>
      {lines.length === 0 ? (
        <div className="mt-6 space-y-4">
          <p className="text-slate">Add items to your cart before placing an order.</p>
          <Link href="/cart" className={paperButton({ variant: "secondary" })}>Return to cart</Link>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-border border-y border-border text-sm">
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
          <li className="flex justify-between py-3 font-medium text-ink">
            <span>Goods (VAT inclusive)</span>
            <span className="tabular-nums">{formatGhs(goods)}</span>
          </li>
        </ul>
      )}
      {lines.length > 0 ? (
        <div className="mt-8">
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
          />
        </div>
      ) : null}
    </main>
  );
}
