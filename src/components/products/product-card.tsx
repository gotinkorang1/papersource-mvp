"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { BulkPriceTable } from "@/components/commerce/bulk-price-table";
import { PaperCard } from "@/components/commerce/paper-card";
import { paperButton } from "@/components/commerce/paper-button";
import { PriceDisplay } from "@/components/commerce/price-display";
import { QuantitySelector } from "@/components/commerce/quantity-selector";
import { QuoteButton } from "@/components/commerce/quote-button";
import { StockBadge } from "@/components/commerce/stock-badge";
import { ProductQuickView } from "@/components/products/product-quick-view";
import { visibleBulkTiers } from "@/features/catalogue/pricing";
import { useOptionalDualPathPreview } from "@/features/preview/dual-path-preview";
import { cn } from "@/lib/utils";
import type { ProductCardModel } from "@/types/catalogue";

export function catalogueImage(product: ProductCardModel) {
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
  style,
  canEdit = false,
  priority = false,
}: {
  product: ProductCardModel;
  onAddToCart?: (product: ProductCardModel, quantity: number) => void;
  onAddToQuote?: (product: ProductCardModel, quantity: number) => void;
  className?: string;
  style?: CSSProperties;
  canEdit?: boolean;
  priority?: boolean;
}) {
  const preview = useOptionalDualPathPreview();
  const addToCart = onAddToCart ?? preview?.addToCart;
  const addToQuote = onAddToQuote ?? preview?.addToQuote;
  const [quantity, setQuantity] = useState(1);
  const imageSource = catalogueImage(product);
  const [resolvedImageSource, setResolvedImageSource] = useState(imageSource);
  const [quickOpen, setQuickOpen] = useState(false);
  const [addedTo, setAddedTo] = useState<"cart" | "quote" | null>(null);
  const out = product.stock === "out";
  const bulkTiers = visibleBulkTiers(product.tiers, product.unitPricePesewas);

  useEffect(() => {
    // Product cards can be reused for a different record without remounting;
    // reset the resolved source when the server-provided image changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResolvedImageSource(imageSource);
  }, [imageSource]);

  useEffect(() => {
    // Clear transient controls when a reused card receives a new product.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuantity(1);
    setQuickOpen(false);
    setAddedTo(null);
  }, [product.id]);

  const confirmAdded = (destination: "cart" | "quote") => {
    setAddedTo(destination);
    window.setTimeout(() => setAddedTo((current) => current === destination ? null : current), 1800);
  };

  return (
    <PaperCard className={cn("group flex min-w-0 flex-col overflow-hidden", className)} style={style}>
      <div className="group relative aspect-[4/3] overflow-hidden border-b border-border bg-cream">
        <Link href={`/product/${product.slug}`} aria-label={`View ${product.name}`} className="absolute inset-0 z-[1] focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-ink">
          <Image src={resolvedImageSource} alt={product.imageAlt.trim() || [product.name, product.specLine].filter(Boolean).join(", ")} fill preload={priority} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} sizes="(max-width: 389px) 100vw, (max-width: 640px) 50vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw" onError={() => { if (resolvedImageSource !== "/images/set-school-stationery.jpg") setResolvedImageSource("/images/set-school-stationery.jpg"); }} className="object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-105" />
          <span className="absolute bottom-3 right-3 rounded-full bg-card/95 px-3 py-1.5 text-xs font-semibold text-ink opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">View details</span>
        </Link>
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/20 via-transparent to-transparent opacity-70" />
        <div className="absolute left-3 top-3 z-10"><StockBadge level={product.stock} /></div>
        {product.isNew || product.isTrending ? <div className="absolute left-3 bottom-3 z-10 flex max-w-[calc(100%-1.5rem)] flex-wrap gap-1.5">
          {product.isNew ? <span className="rounded-full bg-ochre px-2 py-1 text-[0.68rem] font-semibold text-ink shadow-sm">New</span> : null}
          {product.isTrending ? <span className="rounded-full bg-paper-green px-2 py-1 text-[0.68rem] font-semibold text-white shadow-sm">Trending{product.viewCount ? ` · ${product.viewCount}` : ""}</span> : null}
        </div> : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3 sm:gap-3 sm:p-5">
        <div>
          <div className="flex items-start justify-between gap-1.5"><h3 id={`product-name-${product.id}`} className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-ink sm:min-h-[2.75rem] sm:text-base">
            <Link
              href={`/product/${product.slug}`}
              className="hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
            >
              {product.name}
            </Link>
          </h3>{canEdit ? <Link href={`/admin/products/${product.id}`} className="inline-flex min-h-10 shrink-0 items-center text-[0.7rem] font-semibold text-ink underline underline-offset-2">Edit</Link> : null}</div>
          {product.specLine ? <p className="mt-1 line-clamp-2 text-xs leading-4 text-slate sm:min-h-[2.5rem] sm:text-sm sm:leading-5">{product.specLine}</p> : null}
          <p className="mt-1 truncate font-mono text-[0.65rem] tracking-wide text-slate/80 sm:mt-2 sm:text-[0.7rem]">SKU {product.sku}</p>
        </div>
        <PriceDisplay
          pesewas={product.unitPricePesewas}
          unitLabel={product.unitLabel}
          className="text-lg font-semibold sm:text-xl"
        />
        {bulkTiers.length > 0 ? <div className="rounded-lg border border-border/70 bg-cream/60 px-3 py-2"><BulkPriceTable tiers={bulkTiers} unitLabel={product.unitLabel} /></div> : null}
        <p className="line-clamp-1 text-[0.68rem] text-slate sm:text-xs">{product.deliveryBadge.label}</p>
        <QuantitySelector
          value={quantity}
          onChange={setQuantity}
          disabled={out}
        />
        <div className="mt-auto grid grid-cols-2 gap-1.5 sm:gap-2">
          <button
            type="button"
            className={cn(paperButton({ variant: "primary" }), "px-2 text-xs sm:px-3 sm:text-sm")}
            aria-label={addedTo === "cart" ? "Added to Cart" : "Add to Cart"}
            disabled={out}
            onClick={() => { addToCart?.(product, quantity); confirmAdded("cart"); }}
          >
            {addedTo === "cart" ? <><Check className="mr-1 size-3.5 sm:mr-1.5 sm:size-4" aria-hidden /><span className="sm:hidden">Added</span><span className="hidden sm:inline">Added to Cart</span></> : <><span className="sm:hidden">Cart</span><span className="hidden sm:inline">Add to Cart</span></>}
          </button>
          <QuoteButton
            data-testid={`add-to-quote-${product.slug}`}
            className="px-2 text-xs sm:px-3 sm:text-sm"
            aria-label={addedTo === "quote" ? "Added to Quote" : "Add to Quote"}
            onClick={() => { addToQuote?.(product, quantity); confirmAdded("quote"); }}
          >
            {addedTo === "quote" ? <><Check className="mr-1 size-3.5 sm:mr-1.5 sm:size-4" aria-hidden /><span className="sm:hidden">Added</span><span className="hidden sm:inline">Added to Quote</span></> : <><span className="sm:hidden">Quote</span><span className="hidden sm:inline">Add to Quote</span></>}
          </QuoteButton>
        </div>
        <p className="sr-only" role="status" aria-live="polite">{addedTo ? `Added to ${addedTo === "cart" ? "cart" : "quote list"}.` : ""}</p>
        <button
          type="button"
          aria-describedby={`product-name-${product.id}`}
          className="mt-1 inline-flex min-h-10 w-full items-center justify-between border-t border-border/70 pt-2 text-sm font-medium text-slate transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
          onClick={() => setQuickOpen(true)}
        >
          <span>Quick view</span><ArrowUpRight className="size-4 transition-transform motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5" aria-hidden />
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
