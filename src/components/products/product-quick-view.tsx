"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { BulkPriceTable } from "@/components/commerce/bulk-price-table";
import { DeliveryBadge } from "@/components/commerce/delivery-badge";
import { paperButton } from "@/components/commerce/paper-button";
import { PriceDisplay } from "@/components/commerce/price-display";
import { QuantitySelector } from "@/components/commerce/quantity-selector";
import { QuoteButton } from "@/components/commerce/quote-button";
import { StockBadge } from "@/components/commerce/stock-badge";
import { useOptionalDualPathPreview } from "@/features/preview/dual-path-preview";
import type { ProductCardModel } from "@/types/catalogue";

export function ProductQuickView({
  product,
  open,
  onClose,
  onAddToCart,
  onAddToQuote,
}: {
  product: ProductCardModel | null;
  open: boolean;
  onClose: () => void;
  onAddToCart?: (product: ProductCardModel, quantity: number) => void;
  onAddToQuote?: (product: ProductCardModel, quantity: number) => void;
}) {
  const preview = useOptionalDualPathPreview();
  const addToCart = onAddToCart ?? preview?.addToCart;
  const addToQuote = onAddToQuote ?? preview?.addToQuote;
  const [quantity, setQuantity] = useState(1);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) {
      previousFocus.current?.focus();
      return;
    }
    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab") return;
      const dialog = closeRef.current?.closest('[role="dialog"]');
      const focusable = dialog ? Array.from(dialog.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])')) : [];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open || !product) {
    return null;
  }

  const out = product.stock === "out";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 md:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-view-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close quick view"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-xl border border-border bg-card p-5 shadow-lg sm:p-6">
        <button
          type="button"
          ref={closeRef}
          onClick={onClose}
          aria-label="Close quick view"
          className="absolute right-3 top-3 inline-flex size-10 items-center justify-center rounded-full border border-border text-slate transition hover:bg-cream hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          <X className="size-5" aria-hidden />
        </button>
        <h2 id="quick-view-title" className="pr-12 text-xl text-ink">
          {product.name}
        </h2>
        <p className="mt-1 text-sm text-slate">{product.specLine}</p>
        <div className="mt-4 space-y-3">
          <PriceDisplay
            pesewas={product.unitPricePesewas}
            unitLabel={product.unitLabel}
          />
          <BulkPriceTable tiers={product.tiers} unitLabel={product.unitLabel} />
          <StockBadge level={product.stock} />
          <DeliveryBadge zone={product.deliveryBadge} />
          <QuantitySelector
            value={quantity}
            onChange={setQuantity}
            disabled={out}
          />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-2">
          <button
            type="button"
            className={paperButton({ variant: "primary" })}
            disabled={out}
            onClick={() => {
              addToCart?.(product, quantity);
              onClose();
            }}
          >
            Add to Cart
          </button>
          <QuoteButton
            onClick={() => {
              addToQuote?.(product, quantity);
              onClose();
            }}
          >
            Add to Quote
          </QuoteButton>
        </div>
      </div>
    </div>
  );
}
