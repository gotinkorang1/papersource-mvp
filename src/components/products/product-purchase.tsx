"use client";

import { useState } from "react";
import { paperButton } from "@/components/commerce/paper-button";
import { QuantitySelector } from "@/components/commerce/quantity-selector";
import { QuoteButton } from "@/components/commerce/quote-button";
import { useDualPathPreview } from "@/features/preview/dual-path-preview";
import type { ProductCardModel } from "@/types/catalogue";

export function ProductPurchase({ product }: { product: ProductCardModel }) {
  const { addToCart, addToQuote } = useDualPathPreview();
  const [quantity, setQuantity] = useState(1);
  const [addedTo, setAddedTo] = useState<"cart" | "quote" | null>(null);
  const out = product.stock === "out";

  function confirmAdded(destination: "cart" | "quote") {
    setAddedTo(destination);
    window.setTimeout(() => setAddedTo((current) => current === destination ? null : current), 1800);
  }

  return (
    <div className="space-y-3 sm:space-y-4" data-testid="product-purchase">
      <QuantitySelector
        value={quantity}
        onChange={setQuantity}
        disabled={out}
      />
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
        <button
          type="button"
          className={paperButton({ variant: "primary" })}
          disabled={out}
          onClick={() => { addToCart(product, quantity); confirmAdded("cart"); }}
        >
          {addedTo === "cart" ? "Added to Cart" : "Add to Cart"}
        </button>
        <QuoteButton
          data-testid={`add-to-quote-${product.slug}`}
          onClick={() => { addToQuote(product, quantity); confirmAdded("quote"); }}
        >
          {addedTo === "quote" ? "Added to Quote" : "Add to Quote"}
        </QuoteButton>
      </div>
      <p className="sr-only" role="status" aria-live="polite">{addedTo ? `Added to ${addedTo === "cart" ? "cart" : "quote list"}.` : ""}</p>
    </div>
  );
}
