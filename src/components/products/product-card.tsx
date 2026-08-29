"use client";

import Link from "next/link";
import { useState } from "react";
import { BulkPriceTable } from "@/components/commerce/bulk-price-table";
import { PaperCard } from "@/components/commerce/paper-card";
import { paperButton } from "@/components/commerce/paper-button";
import { PriceDisplay } from "@/components/commerce/price-display";
import { QuantitySelector } from "@/components/commerce/quantity-selector";
import { QuoteButton } from "@/components/commerce/quote-button";
import { StockBadge } from "@/components/commerce/stock-badge";
import { ProductQuickView } from "@/components/products/product-quick-view";
import { useOptionalDualPathPreview } from "@/features/preview/dual-path-preview";
import { cn } from "@/lib/utils";
import type { ProductCardModel } from "@/types/catalogue";

export function ProductCard({
  product,
  onAddToCart,
  onAddToQuote,
  className,
}: {
  product: ProductCardModel;
  onAddToCart?: (product: ProductCardModel, quantity: number) => void;
  onAddToQuote?: (product: ProductCardModel, quantity: number) => void;
  className?: string;
}) {
  const preview = useOptionalDualPathPreview();
  const addToCart = onAddToCart ?? preview?.addToCart;
  const addToQuote = onAddToQuote ?? preview?.addToQuote;
  const [quantity, setQuantity] = useState(1);
  const [quickOpen, setQuickOpen] = useState(false);
  const out = product.stock === "out";

  return (
    <PaperCard className={cn("flex flex-col overflow-hidden", className)}>
      <div
        className="relative aspect-[4/3] border-b border-border bg-cream"
        role="img"
        aria-label={product.imageAlt}
      >
        <div className="absolute inset-6 border border-border bg-card shadow-[2px_2px_0_0_rgba(16,42,67,0.06)]" />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="text-base font-medium text-ink">
            <Link
              href={`/product/${product.slug}`}
              className="hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
            >
              {product.name}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-slate">{product.specLine}</p>
        </div>
        <PriceDisplay
          pesewas={product.unitPricePesewas}
          unitLabel={product.unitLabel}
        />
        <BulkPriceTable tiers={product.tiers} unitLabel={product.unitLabel} />
        <StockBadge level={product.stock} />
        <QuantitySelector
          value={quantity}
          onChange={setQuantity}
          disabled={out}
        />
        <div className="mt-auto grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            type="button"
            className={paperButton({ variant: "primary" })}
            disabled={out}
            onClick={() => addToCart?.(product, quantity)}
          >
            Add to Cart
          </button>
          <QuoteButton
            data-testid={`add-to-quote-${product.id}`}
            disabled={out}
            onClick={() => addToQuote?.(product, quantity)}
          >
            Add to Quote
          </QuoteButton>
        </div>
        <button
          type="button"
          className="self-start text-sm text-slate underline-offset-4 hover:text-ink hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
          onClick={() => setQuickOpen(true)}
        >
          Quick view
        </button>
      </div>
      <ProductQuickView
        product={product}
        open={quickOpen}
        onClose={() => setQuickOpen(false)}
        onAddToCart={addToCart}
        onAddToQuote={addToQuote}
      />
    </PaperCard>
  );
}
