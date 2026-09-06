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
  const out = product.stock === "out";

  return (
    <div className="space-y-4">
      <QuantitySelector
        value={quantity}
        onChange={setQuantity}
        disabled={out}
      />
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          type="button"
          className={paperButton({ variant: "primary" })}
          disabled={out}
          onClick={() => addToCart(product, quantity)}
        >
          Add to Cart
        </button>
        <QuoteButton
          data-testid={`add-to-quote-${product.slug}`}
          onClick={() => addToQuote(product, quantity)}
        >
          Add to Quote
        </QuoteButton>
      </div>
    </div>
  );
}
