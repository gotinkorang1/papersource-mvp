import type { Metadata } from "next";
import { ProductGridList } from "@/components/products/product-grid-list";
import { listProductCards } from "@/features/catalogue";

export const metadata: Metadata = {
  title: "Shop workplace supplies in Ghana",
  description:
    "Office stationery, paper, toner and workplace essentials from PaperSource. Accra and Tema delivery, nationwide on request.",
};

export default async function ShopPage() {
  const products = await listProductCards();

  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl text-ink">Shop</h1>
      <p className="mt-3 max-w-2xl text-slate">
        One catalogue for retail checkout and bulk quotation. Add to Cart and
        Add to Quote are independent.
      </p>
      <div className="mt-10">
        <ProductGridList products={products} />
      </div>
    </main>
  );
}
