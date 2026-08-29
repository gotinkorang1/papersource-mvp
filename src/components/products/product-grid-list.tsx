"use client";

import { ProductCard } from "@/components/products/product-card";
import { ProductGrid } from "@/components/products/product-grid";
import { useDualPathPreview } from "@/features/preview/dual-path-preview";
import type { ProductCardModel } from "@/types/catalogue";

export function ProductGridList({
  products,
}: {
  products: ProductCardModel[];
}) {
  const { addToCart, addToQuote } = useDualPathPreview();

  if (products.length === 0) {
    return (
      <p className="text-slate">
        No products in this selection yet. Try another category or a broader
        search.
      </p>
    );
  }

  return (
    <ProductGrid>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={addToCart}
          onAddToQuote={addToQuote}
        />
      ))}
    </ProductGrid>
  );
}
