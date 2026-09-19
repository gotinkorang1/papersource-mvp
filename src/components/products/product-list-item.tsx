"use client";

import Image from "next/image";
import Link from "next/link";
import { Eye, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { catalogueImage } from "@/components/products/product-card";
import { paperButton } from "@/components/commerce/paper-button";
import { PriceDisplay } from "@/components/commerce/price-display";
import { QuoteButton } from "@/components/commerce/quote-button";
import { StockBadge } from "@/components/commerce/stock-badge";
import { cn } from "@/lib/utils";
import type { ProductCardModel } from "@/types/catalogue";

function PresentationBadges({ product }: { product: ProductCardModel }) {
  return product.isNew || product.isTrending ? (
    <div className="flex flex-wrap gap-1.5">
      {product.isNew ? <span className="rounded-full bg-ochre/15 px-2 py-1 text-[0.68rem] font-semibold text-ink">New</span> : null}
      {product.isTrending ? <span className="rounded-full bg-paper-green/15 px-2 py-1 text-[0.68rem] font-semibold text-paper-green">Trending{product.viewCount ? ` · ${product.viewCount}` : ""}</span> : null}
    </div>
  ) : null;
}

export function ProductListItem({
  product,
  variant = "list",
  onAddToCart,
  onAddToQuote,
  canEdit = false,
  priority = false,
}: {
  product: ProductCardModel;
  variant?: "list" | "content";
  onAddToCart?: (product: ProductCardModel, quantity: number) => void;
  onAddToQuote?: (product: ProductCardModel, quantity: number) => void;
  canEdit?: boolean;
  priority?: boolean;
}) {
  const out = product.stock === "out";
  const content = variant === "content";
  const imageSource = catalogueImage(product);
  const [resolvedImageSource, setResolvedImageSource] = useState(imageSource);

  useEffect(() => {
    // List items can be reused for a different record during client navigation.
    // Reset the fallback when the server-provided image changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResolvedImageSource(imageSource);
  }, [imageSource]);

  return (
    <article
      data-catalogue-item={variant}
      className={cn(
        "group grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md sm:gap-4 sm:p-4",
        content ? "grid-cols-[6.5rem_minmax(0,1fr)] sm:grid-cols-[12rem_minmax(0,1fr)_auto]" : "sm:grid-cols-[8rem_minmax(0,1fr)_auto]",
      )}
    >
      <Link href={`/product/${product.slug}`} className={cn("relative block min-w-0 self-start overflow-hidden rounded-xl bg-cream", content ? "aspect-[4/3]" : "aspect-square")} aria-label={`View ${product.name}`}>
        <Image src={resolvedImageSource} alt={product.imageAlt.trim() || product.name} fill preload={priority} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} sizes={content ? "(max-width: 640px) 104px, 192px" : "(max-width: 640px) 88px, 128px"} onError={() => { if (resolvedImageSource !== "/images/set-school-stationery.jpg") setResolvedImageSource("/images/set-school-stationery.jpg"); }} className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-105" />
      </Link>
      <div className="min-w-0 self-center">
        <div className="flex flex-wrap items-center gap-2"><PresentationBadges product={product} /><StockBadge level={product.stock} /></div>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-2">
          <h3 className="min-w-0 text-base font-semibold leading-snug text-ink sm:text-lg"><Link href={`/product/${product.slug}`} className="hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink">{product.name}</Link></h3>
          {canEdit ? <Link href={`/admin/products/${product.id}`} className="text-xs font-semibold text-ink underline underline-offset-2">Edit</Link> : null}
        </div>
        {product.specLine ? <p className={cn("mt-1 text-sm text-slate", content ? "line-clamp-3" : "line-clamp-2")}>{product.specLine}</p> : null}
        <p className="mt-1 truncate font-mono text-[0.68rem] tracking-wide text-slate/80">SKU {product.sku}</p>
        <div className="mt-2 sm:hidden"><PriceDisplay pesewas={product.unitPricePesewas} unitLabel={product.unitLabel} className="text-base font-semibold" /></div>
        {content ? <p className="mt-3 line-clamp-3 max-w-2xl text-sm leading-6 text-slate">{product.specLine ? `${product.specLine}. ` : ""}{product.stock === "out" ? "Currently out of stock; contact us for availability and delivery support across Accra and Tema." : product.stock === "low" ? "Limited stock available with clear pricing and delivery support across Accra and Tema." : "Available with clear pricing, stock visibility, and delivery support across Accra and Tema."}</p> : null}
      </div>
      <div className="col-span-2 flex min-w-0 flex-col justify-center gap-3 border-t border-border/70 pt-3 sm:col-span-1 sm:min-w-[10rem] sm:items-end sm:border-t-0 sm:pt-0">
        <div className="hidden sm:block"><PriceDisplay pesewas={product.unitPricePesewas} unitLabel={product.unitLabel} className="text-lg font-semibold" /></div>
        <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:min-w-[10rem] sm:grid-cols-1">
          <button type="button" aria-label="Add to Cart" disabled={out} onClick={() => onAddToCart?.(product, 1)} className={cn(paperButton({ variant: "primary" }), "min-h-10 px-3 text-xs")}><ShoppingCart className="mr-1.5 size-3.5" aria-hidden />Cart</button>
          <QuoteButton aria-label="Add to Quote" onClick={() => onAddToQuote?.(product, 1)} className="min-h-10 px-3 text-xs"><Eye className="mr-1.5 size-3.5" aria-hidden />Quote</QuoteButton>
        </div>
      </div>
    </article>
  );
}
