"use client";

import { useState } from "react";
import { SubmitProgressButton } from "@/components/admin/submit-progress-button";
import { paperButton } from "@/components/commerce/paper-button";
import { QuantitySelector } from "@/components/commerce/quantity-selector";
import { QuoteButton } from "@/components/commerce/quote-button";
import { useDualPathPreview } from "@/features/preview/dual-path-preview";
import type { ProductCardModel } from "@/types/catalogue";

export function ProductPurchase({ product, savedLists = [] }: { product: ProductCardModel; savedLists?: { id: string; name: string }[] }) {
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
      {savedLists.length ? (
        <form action="/account/lists/items/mutate" method="post" className="grid gap-2 rounded-lg border border-border bg-cream/50 p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <input type="hidden" name="intent" value="add" />
          <input type="hidden" name="variantId" value={product.variantId} />
          <input type="hidden" name="quantity" value={quantity} />
          <label className="grid gap-1 text-xs font-semibold text-ink">
            Save to list
            <select name="listId" aria-label="Save to list" className="h-10 rounded-md border border-border bg-card px-2 text-sm font-normal text-ink">
              {savedLists.map((list) => <option key={list.id} value={list.id}>{list.name}</option>)}
            </select>
          </label>
          <SubmitProgressButton idleLabel="Save product" pendingLabel="Saving…" className="inline-flex min-h-11 items-center justify-center rounded-md border border-ink px-3 py-2 text-sm font-semibold text-ink transition-colors hover:bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink" />
        </form>
      ) : null}
      <p className="sr-only" role="status" aria-live="polite">{addedTo ? `Added to ${addedTo === "cart" ? "cart" : "quote list"}.` : ""}</p>
    </div>
  );
}
