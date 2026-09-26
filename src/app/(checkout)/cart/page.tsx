import type { Metadata } from "next";
import Link from "next/link";
import {
  removeCartLineAction,
  updateCartQuantityAction,
} from "@/features/checkout/actions";
import { listCartLines } from "@/features/cart/repository";
import { paperButton } from "@/components/commerce/paper-button";
import { SubmitProgressButton } from "@/components/admin/submit-progress-button";
import { formatGhs } from "@/lib/money";
import { isDatabaseConfigured } from "@/lib/db/client";
import { readCommerceIdentity } from "@/lib/customer/commerce";

export const metadata: Metadata = {
  title: "Cart",
  robots: { index: false, follow: true },
};

type PageProps = {
  searchParams: Promise<{ added?: string; unknown?: string; quoteOnly?: string; notice?: string; warning?: string }>;
};

export default async function CartPage({ searchParams }: PageProps) {
  const sessionId = isDatabaseConfigured() ? await readCommerceIdentity() : null;
  const lines = sessionId ? await listCartLines(sessionId) : [];
  const { added, unknown, quoteOnly, notice, warning } = await searchParams;
  const subtotal = lines.reduce(
    (sum, line) => sum + line.unitPricePesewas * line.quantity,
    0,
  );

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl text-ink">Cart</h1>
      <p className="mt-3 text-slate">
        Retail checkout only. Quote lines stay in Quote List.
      </p>
      {added ? (
        <p className="mt-4 text-sm text-ink">
          Added {added} {added === "1" ? "line" : "lines"} from Quick Order.
        </p>
      ) : null}
      {unknown ? (
        <p role="alert" className="mt-3 text-sm text-error">
          Not found: {unknown}
        </p>
      ) : null}
      {notice ? (
        <p role="status" className="mt-3 text-sm text-paper-green">
          {notice === "updated" ? "Quantity updated." : notice === "removed" ? "Item removed from cart." : notice}
        </p>
      ) : null}
      {warning ? (
        <p role="alert" className="mt-3 text-sm text-error">
          {warning}
        </p>
      ) : null}
      {quoteOnly ? (
        <p className="mt-3 text-sm text-slate">
          Request-quote at that quantity: {quoteOnly}.{" "}
          <Link href="/quick-order" className="underline">
            Add those SKUs to quote
          </Link>
          .
        </p>
      ) : null}
      {lines.length === 0 ? (
        <div className="mt-8 space-y-4">
          <p className="text-slate">Your cart is empty. Browse the catalogue to add retail items for checkout.</p>
          <Link href="/shop" className={paperButton({ variant: "primary" })}>Shop workplace supplies</Link>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          <ul className="divide-y divide-border border-y border-border">
            {lines.map((line) => (
              <li key={line.id} className="flex flex-wrap items-start justify-between gap-4 py-4">
                <div>
                  <p className="font-medium text-ink">{line.name}</p>
                  <p className="text-sm text-slate">{line.specLine}</p>
                  <p className="mt-1 text-sm tabular-nums text-ink">
                    {formatGhs(line.unitPricePesewas)} / {line.unitLabel}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <form action={updateCartQuantityAction} className="flex items-center gap-2">
                    <input type="hidden" name="variantId" value={line.id} />
                    <label className="sr-only" htmlFor={`qty-${line.id}`}>
                      Quantity for {line.name}
                    </label>
                    <input
                      id={`qty-${line.id}`}
                      name="quantity"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      defaultValue={line.quantity}
                      className="h-11 w-16 rounded-md border border-border bg-cream px-2 text-sm tabular-nums focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                    />
                    <SubmitProgressButton idleLabel="Update" pendingLabel="Updating…" className="text-sm text-slate underline" />
                  </form>
                  <form action={removeCartLineAction}>
                    <input type="hidden" name="variantId" value={line.id} />
                    <SubmitProgressButton idleLabel="Remove" pendingLabel="Removing…" className="text-sm text-error underline" />
                  </form>
                </div>
              </li>
            ))}
          </ul>
          <p className="text-ink">
            Subtotal (preview) {formatGhs(subtotal)}
          </p>
          <Link href="/checkout" className={paperButton()}>
            Checkout
          </Link>
        </div>
      )}
    </main>
  );
}
