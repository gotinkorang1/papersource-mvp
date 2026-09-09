"use client";

import Link from "next/link";
import { PaperDrawer } from "@/components/commerce/paper-drawer";
import { paperButton } from "@/components/commerce/paper-button";
import { formatGhs } from "@/lib/money";
import { useDualPathPreview } from "@/features/preview/dual-path-preview";

export function CartDrawer() {
  const { cartLines, cartOpen, setCartOpen, clearCart, syncError } = useDualPathPreview();
  const subtotal = cartLines.reduce(
    (sum, line) => sum + line.unitPricePesewas * line.quantity,
    0,
  );

  return (
    <PaperDrawer
      open={cartOpen}
      title="Cart"
      description="Retail checkout only. Quote lines live in Quote List."
      onClose={() => setCartOpen(false)}
      footer={
        <>
          {cartLines.length > 0 ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-ink">Subtotal (preview) {formatGhs(subtotal)}</p>
              <button type="button" onClick={clearCart} className="text-xs font-medium text-error underline underline-offset-2 transition hover:text-error/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Clear cart</button>
            </div>
          ) : null}
          <div className="flex flex-col gap-2">
            <Link
              href="/cart"
              className={paperButton({ variant: "secondary" })}
              onClick={() => setCartOpen(false)}
            >
              View cart
            </Link>
            <Link
              href="/checkout"
              className={paperButton({ variant: "primary" })}
              onClick={() => setCartOpen(false)}
            >
              Checkout
            </Link>
          </div>
        </>
      }
    >
      {syncError ? <p role="alert" className="mb-4 rounded-md border border-error/40 bg-error/10 px-3 py-2 text-sm text-error">{syncError}</p> : null}
      {cartLines.length === 0 ? (
        <p className="text-sm text-slate">Your cart is empty.</p>
      ) : (
        <ul className="divide-y divide-border border-y border-border">
          {cartLines.map((line) => (
            <li key={line.id} className="py-3">
              <p className="text-sm font-medium text-ink">{line.name}</p>
              <p className="text-sm text-slate">{line.specLine}</p>
              <p className="mt-1 text-sm tabular-nums text-ink">
                {line.quantity} × {formatGhs(line.unitPricePesewas)} /{" "}
                {line.unitLabel}
              </p>
            </li>
          ))}
        </ul>
      )}
    </PaperDrawer>
  );
}
