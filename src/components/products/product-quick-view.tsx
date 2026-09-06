"use client";

import { useState } from "react";
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
      <div className="relative z-10 w-full max-w-lg rounded-md border border-border bg-card p-6 shadow-lg">
        <h2 id="quick-view-title" className="text-xl text-ink">
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
