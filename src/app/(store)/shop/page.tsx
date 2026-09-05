import type { Metadata } from "next";
import { ProductGridList } from "@/components/products/product-grid-list";
import { CatalogueToolbar } from "@/components/products/catalogue-toolbar";
import { listBrands, listDivisionCategories, listProductCards } from "@/features/catalogue";
import type { ProductCardModel } from "@/types/catalogue";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";

export const metadata: Metadata = {
  title: "Shop workplace supplies in Ghana",
  description:
    "Office stationery, paper, toner and workplace essentials from PaperSource. Accra and Tema delivery, nationwide on request.",
};

type PageProps = { searchParams: Promise<{ q?: string; category?: string; brand?: string; sort?: string }> };

export default async function ShopPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const category = params.category ?? "";
  const brand = params.brand ?? "";
  const sort = ["featured", "name-asc", "price-asc", "price-desc"].includes(params.sort ?? "") ? params.sort! : "featured";
  const [products, categories, brands] = await Promise.all([
    listProductCards({ query, categorySlug: category, brandSlug: brand }),
    listDivisionCategories(),
    listBrands(),
  ]);
  const sortedProducts = [...products].sort((a: ProductCardModel, b: ProductCardModel) => {
    if (sort === "name-asc") return a.name.localeCompare(b.name);
    if (sort === "price-asc") return a.unitPricePesewas - b.unitPricePesewas;
    if (sort === "price-desc") return b.unitPricePesewas - a.unitPricePesewas;
    return 0;
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <Breadcrumbs items={[{ label: "Shop" }]} />
      <h1 className="text-3xl text-ink">Shop</h1>
      <p className="mt-3 max-w-2xl text-slate">
        One catalogue for retail checkout and bulk quotation. Add to Cart and
        Add to Quote are independent.
      </p>
      <div className="mt-8">
        <CatalogueToolbar count={sortedProducts.length} query={query} category={category} brand={brand} sort={sort} categories={categories} brands={brands} />
      </div>
      <div className="mt-8">
        <ProductGridList products={sortedProducts} />
      </div>
    </main>
  );
}
