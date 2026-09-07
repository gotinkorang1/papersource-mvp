"use client";

import { ProductCard } from "@/components/products/product-card";
import { ProductGrid } from "@/components/products/product-grid";
import { useDualPathPreview } from "@/features/preview/dual-path-preview";
import Link from "next/link";
import type { ProductCardModel } from "@/types/catalogue";

export function ProductGridList({
  products,
  canEdit = false,
}: {
  products: ProductCardModel[];
  canEdit?: boolean;
}) {
  const { addToCart, addToQuote } = useDualPathPreview();

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
    <ProductGrid>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2"
          onAddToCart={addToCart}
          onAddToQuote={addToQuote}
          canEdit={canEdit}
        />
      ))}
    </ProductGrid>
  );
}
