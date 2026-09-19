"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, Eye, ShoppingCart } from "lucide-react";
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
}: {
  product: ProductCardModel;
  variant?: "list" | "content";
  onAddToCart?: (product: ProductCardModel, quantity: number) => void;
  onAddToQuote?: (product: ProductCardModel, quantity: number) => void;
  canEdit?: boolean;
}) {
  const out = product.stock === "out";
  const content = variant === "content";
  return (
    <article
      data-catalogue-item={variant}
      className={cn(
        "group grid gap-4 rounded-2xl border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md sm:p-4",
        content ? "sm:grid-cols-[12rem_minmax(0,1fr)_auto]" : "sm:grid-cols-[8rem_minmax(0,1fr)_auto]",
      )}
    >
      <Link href={`/product/${product.slug}`} className={cn("relative block overflow-hidden rounded-xl bg-cream", content ? "aspect-[4/3]" : "aspect-square")} aria-label={`View ${product.name}`}>
        <Image src={catalogueImage(product)} alt={product.imageAlt.trim() || product.name} fill sizes={content ? "(max-width: 640px) 100vw, 192px" : "(max-width: 640px) 100vw, 128px"} className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-105" />
      </Link>
      <div className="min-w-0 self-center">
        <div className="flex flex-wrap items-center gap-2"><PresentationBadges product={product} /><StockBadge level={product.stock} /></div>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-2">
          <h3 className="min-w-0 text-base font-semibold leading-snug text-ink sm:text-lg"><Link href={`/product/${product.slug}`} className="hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink">{product.name}</Link></h3>
          {canEdit ? <Link href={`/admin/products/${product.id}`} className="text-xs font-semibold text-ink underline underline-offset-2">Edit</Link> : null}
        </div>
        {product.specLine ? <p className={cn("mt-1 text-sm text-slate", content ? "line-clamp-3" : "line-clamp-2")}>{product.specLine}</p> : null}
        <p className="mt-1 truncate font-mono text-[0.68rem] tracking-wide text-slate/80">SKU {product.sku}</p>
        {content ? <p className="mt-3 hidden max-w-2xl text-sm leading-6 text-slate sm:block">Reliable workplace supply with clear pricing, stock visibility, and delivery support across Accra and Tema.</p> : null}
      </div>
      <div className="flex min-w-[10rem] flex-col justify-center gap-3 sm:items-end">
        <PriceDisplay pesewas={product.unitPricePesewas} unitLabel={product.unitLabel} className="text-lg font-semibold" />
        <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:min-w-[10rem] sm:grid-cols-1">
          <button type="button" aria-label="Add to Cart" disabled={out} onClick={() => onAddToCart?.(product, 1)} className={cn(paperButton({ variant: "primary" }), "min-h-10 px-3 text-xs")}><ShoppingCart className="mr-1.5 size-3.5" aria-hidden />Cart</button>
          <QuoteButton aria-label="Add to Quote" onClick={() => onAddToQuote?.(product, 1)} className="min-h-10 px-3 text-xs"><Eye className="mr-1.5 size-3.5" aria-hidden />Quote</QuoteButton>
        </div>
      </div>
    </article>
  );
}
