"use client";

import { ProductCard } from "@/components/products/product-card";
import { ProductGrid } from "@/components/products/product-grid";
import { CatalogueViewModeControl, type CatalogueViewMode } from "@/components/products/catalogue-view-mode";
import { ProductListItem } from "@/components/products/product-list-item";
import { useDualPathPreview } from "@/features/preview/dual-path-preview";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { ProductCardModel } from "@/types/catalogue";

const VIEW_MODE_STORAGE_KEY = "papersource.catalogue.view-mode";

export function ProductGridList({
  products,
  canEdit = false,
  viewMode: controlledViewMode,
  onViewModeChange,
  showViewModeControl = true,
}: {
  products: ProductCardModel[];
  canEdit?: boolean;
  viewMode?: CatalogueViewMode;
  onViewModeChange?: (value: CatalogueViewMode) => void;
  showViewModeControl?: boolean;
}) {
  const { addToCart, addToQuote } = useDualPathPreview();
  const [viewMode, setSelectedViewMode] = useState<CatalogueViewMode>(controlledViewMode ?? "default");

  useEffect(() => {
    if (controlledViewMode) {
      setSelectedViewMode(controlledViewMode);
      return;
    }
    const saved = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    if (saved === "default" || saved === "grid" || saved === "list" || saved === "content") setSelectedViewMode(saved);
  }, [controlledViewMode]);

  const setViewMode = (next: CatalogueViewMode) => {
    setSelectedViewMode(next);
    window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, next);
    onViewModeChange?.(next);
  };

  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 text-center shadow-sm sm:p-8">
        <p className="font-heading text-xl text-ink">Nothing matched this selection</p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate">
          Try a broader search, browse the full catalogue, or send us your requirements for a tailored quote.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link href="/shop" className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Browse all products</Link>
          <Link href="/request-quote" className="rounded-md border border-border px-4 py-2 text-sm font-medium text-ink transition hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Request a quote</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {showViewModeControl ? <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-slate" aria-live="polite">{products.length} {products.length === 1 ? "product" : "products"}</p><CatalogueViewModeControl value={viewMode} onChange={setViewMode} compact /></div> : null}
      {viewMode === "list" || viewMode === "content" ? (
        <div data-catalogue-view={viewMode} className="grid gap-3">
          {products.map((product) => <ProductListItem key={product.id} product={product} variant={viewMode} onAddToCart={addToCart} onAddToQuote={addToQuote} canEdit={canEdit} />)}
        </div>
      ) : (
        <ProductGrid className={viewMode === "grid" ? "sm:grid-cols-3 xl:grid-cols-5" : undefined}>
          {products.map((product, index) => (
            <div key={product.id} data-catalogue-view={viewMode}>
              <ProductCard
                product={product}
                className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2"
                style={{ animationDelay: `${Math.min(index, 11) * 45}ms` }}
                onAddToCart={addToCart}
                onAddToQuote={addToQuote}
                canEdit={canEdit}
                priority={index === 0}
              />
            </div>
          ))}
        </ProductGrid>
      )}
    </div>
  );
}
