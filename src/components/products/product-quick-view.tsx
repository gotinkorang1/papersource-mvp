"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { BulkPriceTable } from "@/components/commerce/bulk-price-table";
import { DeliveryBadge } from "@/components/commerce/delivery-badge";
import { paperButton } from "@/components/commerce/paper-button";
import { PriceDisplay } from "@/components/commerce/price-display";
import { visibleBulkTiers } from "@/features/catalogue/pricing";
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
  const onCloseRef = useRef(onClose);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (!open) return;
    // A reopened quick view starts a fresh quantity decision for the current product.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuantity(1);
  }, [open, product?.id]);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) {
      if (wasOpen.current) {
        previousFocus.current?.focus();
      }
      wasOpen.current = false;
      return;
    }
    wasOpen.current = true;
    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
      if (event.key !== "Tab") return;
      const dialog = closeRef.current?.closest('[role="dialog"]');
      const focusable = dialog ? Array.from(dialog.querySelectorAll<HTMLElement>('button:not([disabled]):not([tabindex="-1"]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])')) : [];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open || !product || typeof document === "undefined") {
    return null;
  }

  const out = product.stock === "out";
  const bulkTiers = product ? visibleBulkTiers(product.tiers, product.unitPricePesewas) : [];

  return createPortal(
    (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 md:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-view-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="relative z-10 max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-card p-5 shadow-lg sm:p-6" onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          ref={closeRef}
          onClick={onClose}
          aria-label="Close quick view"
          className="absolute right-3 top-3 inline-flex size-11 items-center justify-center rounded-full border border-border text-slate transition hover:bg-cream hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          <X className="size-5" aria-hidden />
        </button>
        <h2 id="quick-view-title" className="pr-12 text-xl text-ink">
          {product.name}
        </h2>
        {product.specLine ? <p className="mt-1 text-sm text-slate">{product.specLine}</p> : null}
        <div className="mt-4 space-y-3">
          <PriceDisplay
            pesewas={product.unitPricePesewas}
            unitLabel={product.unitLabel}
          />
          {bulkTiers.length > 0 ? (
            <BulkPriceTable tiers={bulkTiers} unitLabel={product.unitLabel} />
          ) : null}
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
            className={`${paperButton({ variant: "primary" })} px-2 text-xs sm:px-3 sm:text-sm`}
            aria-label="Add to Cart"
            disabled={out}
            onClick={() => {
              addToCart?.(product, quantity);
              onClose();
            }}
          >
            <span className="sm:hidden">Cart</span>
            <span className="hidden sm:inline">Add to Cart</span>
          </button>
          <QuoteButton
            className="px-2 text-xs sm:px-3 sm:text-sm"
            aria-label="Add to Quote"
            onClick={() => {
              addToQuote?.(product, quantity);
              onClose();
            }}
          >
            <span className="sm:hidden">Quote</span>
            <span className="hidden sm:inline">Add to Quote</span>
          </QuoteButton>
        </div>
      </div>
    </div>
    ),
    document.body,
  );
}
