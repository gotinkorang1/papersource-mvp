"use client";

import { ProductCard } from "@/components/products/product-card";
import { ProductGrid } from "@/components/products/product-grid";
import { useDualPathPreview } from "@/features/preview/dual-path-preview";
import { sampleProducts } from "@/lib/design-system/fixtures";

export function FeaturedCatalogue() {
  const { addToCart, addToQuote } = useDualPathPreview();

  return (
    <ProductGrid>
      {sampleProducts.map((product) => (
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
