"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Check } from "lucide-react";
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

function catalogueImage(product: ProductCardModel) {
  if (product.imageSrc) return product.imageSrc;
  const name = `${product.name} ${product.specLine}`.toLowerCase();
  if (name.includes("book") || name.includes("novel")) return "/images/stack-books-with-library-scene.jpg";
  if (name.includes("toner") || name.includes("printer") || name.includes("ink")) return "/images/home-printer-based-toner.jpg";
  return "/images/set-school-stationery.jpg";
}

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
  const [addedTo, setAddedTo] = useState<"cart" | "quote" | null>(null);
  const out = product.stock === "out";

  const confirmAdded = (destination: "cart" | "quote") => {
    setAddedTo(destination);
    window.setTimeout(() => setAddedTo((current) => current === destination ? null : current), 1800);
  };

  return (
    <PaperCard className={cn("flex flex-col overflow-hidden", className)}>
      <div className="group relative aspect-[4/3] overflow-hidden border-b border-border bg-cream">
        <Image src={catalogueImage(product)} alt={product.imageAlt} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw" className="object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-105" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/20 via-transparent to-transparent opacity-70" />
        <div className="absolute left-3 top-3"><StockBadge level={product.stock} /></div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="min-h-[2.75rem] text-base font-semibold leading-snug text-ink">
            <Link
              href={`/product/${product.slug}`}
              className="hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
            >
              {product.name}
            </Link>
          </h3>
          <p className="mt-1 min-h-[2.5rem] text-sm leading-5 text-slate">{product.specLine}</p>
        </div>
        <PriceDisplay
          pesewas={product.unitPricePesewas}
          unitLabel={product.unitLabel}
          className="text-xl font-semibold"
        />
        {product.tiers.length > 0 ? <div className="rounded-lg border border-border/70 bg-cream/60 px-3 py-2"><BulkPriceTable tiers={product.tiers} unitLabel={product.unitLabel} /></div> : null}
        <p className="text-xs text-slate">{product.deliveryBadge.label}</p>
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
            onClick={() => { addToCart?.(product, quantity); confirmAdded("cart"); }}
          >
            {addedTo === "cart" ? <><Check className="mr-1.5 size-4" aria-hidden />Added to Cart</> : "Add to Cart"}
          </button>
          <QuoteButton
            data-testid={`add-to-quote-${product.slug}`}
            onClick={() => { addToQuote?.(product, quantity); confirmAdded("quote"); }}
          >
            {addedTo === "quote" ? <><Check className="mr-1.5 size-4" aria-hidden />Added to Quote</> : "Add to Quote"}
          </QuoteButton>
        </div>
        <p className="sr-only" role="status" aria-live="polite">{addedTo ? `Added to ${addedTo === "cart" ? "cart" : "quote list"}.` : ""}</p>
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
