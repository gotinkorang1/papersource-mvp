import type { Metadata } from "next";
import { ProductGridList } from "@/components/products/product-grid-list";
import { CatalogueToolbar } from "@/components/products/catalogue-toolbar";
import { listBrands, listDivisionCategories, listProductCards } from "@/features/catalogue";
import type { ProductCardModel } from "@/types/catalogue";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { CataloguePagination } from "@/components/products/catalogue-pagination";
import { pageMetadata } from "@/lib/seo";
import { canAccessAdmin } from "@/lib/staff/rbac";
import { readStaffActor } from "@/lib/staff/require";

export const metadata: Metadata = pageMetadata({
  title: "Shop workplace supplies in Ghana",
  description: "Office stationery, paper, toner and workplace essentials from PaperSource. Accra and Tema delivery, nationwide on request.",
  path: "/shop",
});

type PageProps = { searchParams: Promise<{ q?: string; category?: string; brand?: string; sort?: string; availability?: string; zone?: string; page?: string }> };

export default async function ShopPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const category = params.category ?? "";
  const brand = params.brand ?? "";
  const sort = ["featured", "name-asc", "price-asc", "price-desc"].includes(params.sort ?? "") ? params.sort! : "featured";
  const availability = ["in_stock", "low", "out"].includes(params.availability ?? "") ? params.availability! : "";
  const zone = ["accra", "tema", "nationwide"].includes(params.zone ?? "") ? params.zone! : "";
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
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
  const filteredProducts = sortedProducts.filter((product) => (!availability || product.stock === availability) && (!zone || (zone === "nationwide" ? product.deliveryBadge.feeMode === "on_request" : product.deliveryBadge.label.toLowerCase().includes(zone))));
  const pageSize = 24;
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const visibleProducts = filteredProducts.slice((Math.min(page, totalPages) - 1) * pageSize, Math.min(page, totalPages) * pageSize);
  const staff = await readStaffActor();
  const canEdit = staff ? canAccessAdmin(staff.role, "products", "write") : false;

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
      <Breadcrumbs items={[{ label: "Shop" }]} />
      <h1 className="mt-5 text-4xl text-ink md:text-5xl">Shop workplace essentials</h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate md:text-lg">
        One catalogue for retail checkout and bulk quotation. Add to Cart and
        Add to Quote are independent.
      </p>
      <div className="mt-8">
        <CatalogueToolbar count={filteredProducts.length} query={query} category={category} brand={brand} sort={sort} availability={availability} categories={categories} brands={brands} />
      </div>
      <div className="mt-8">
        <ProductGridList products={visibleProducts} canEdit={canEdit} />
        <CataloguePagination page={Math.min(page, totalPages)} totalPages={totalPages} totalItems={filteredProducts.length} pageSize={pageSize} query={{ q: query, category, brand, sort, availability, zone }} />
      </div>
    </main>
  );
}
