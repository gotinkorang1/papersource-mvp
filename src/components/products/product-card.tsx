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
  canEdit = false,
}: {
  product: ProductCardModel;
  onAddToCart?: (product: ProductCardModel, quantity: number) => void;
  onAddToQuote?: (product: ProductCardModel, quantity: number) => void;
  className?: string;
  canEdit?: boolean;
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
    <PaperCard className={cn("group flex flex-col overflow-hidden", className)}>
      <div className="group relative aspect-[4/3] overflow-hidden border-b border-border bg-cream">
        <Link href={`/product/${product.slug}`} aria-label={`View ${product.name}`} className="absolute inset-0 z-[1] focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-ink">
          <Image src={catalogueImage(product)} alt={product.imageAlt} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw" className="object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-105" />
        </Link>
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/20 via-transparent to-transparent opacity-70" />
        <div className="absolute left-3 top-3 z-10"><StockBadge level={product.stock} /></div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <div className="flex items-start justify-between gap-2"><h3 className="min-h-[2.75rem] text-base font-semibold leading-snug text-ink">
            <Link
              href={`/product/${product.slug}`}
              className="hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
            >
              {product.name}
            </Link>
          </h3>{canEdit ? <Link href={`/admin/products/${product.id}`} className="inline-flex min-h-10 shrink-0 items-center text-[0.7rem] font-semibold text-ink underline underline-offset-2">Edit</Link> : null}</div>
          <p className="mt-1 min-h-[2.5rem] line-clamp-2 text-sm leading-5 text-slate">{product.specLine}</p>
          <p className="mt-2 font-mono text-[0.7rem] tracking-wide text-slate/80">SKU {product.sku}</p>
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
          className="inline-flex min-h-10 self-start items-center text-sm text-slate underline-offset-4 hover:text-ink hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
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
