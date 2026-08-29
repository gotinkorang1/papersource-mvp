import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { listCartLines } from "@/features/cart/repository";
import { formatGhs } from "@/lib/money";
import { isDatabaseConfigured } from "@/lib/db/client";
import { readGuestSessionId } from "@/lib/session/guest";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: true },
};

export default async function CheckoutPage() {
  const sessionId = isDatabaseConfigured() ? await readGuestSessionId() : null;
  const lines = sessionId ? await listCartLines(sessionId) : [];
  const goods = lines.reduce(
    (sum, line) => sum + line.unitPricePesewas * line.quantity,
    0,
  );

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl text-ink">Checkout</h1>
      <p className="mt-3 text-slate">
        Ghana delivery. Prices are confirmed on the server. Accra and Tema
        orders can pay with Paystack after the order is recorded. Nationwide
        orders wait for delivery terms — no fee is invented here.
      </p>
      {lines.length === 0 ? (
        <p className="mt-6 text-slate">
          Add items to your{" "}
          <Link href="/cart" className="underline">
            cart
          </Link>{" "}
          before placing an order.
        </p>
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
      <div className="mt-8">
        <CheckoutForm canPlaceOrder={lines.length > 0} />
      </div>
    </main>
  );
}
