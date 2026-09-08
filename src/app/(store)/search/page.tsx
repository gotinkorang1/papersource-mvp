import type { Metadata } from "next";
import Link from "next/link";
import { HeaderSearch } from "@/components/navigation/header-search";
import { ProductGridList } from "@/components/products/product-grid-list";
import { listProductCards } from "@/features/catalogue";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { listDivisionCategories, listFeaturedProductCards } from "@/features/catalogue";
import { PopularCategories } from "@/components/products/popular-categories";
import { RecentSearches } from "@/components/products/recent-searches";
import { canAccessAdmin } from "@/lib/staff/rbac";
import { readStaffActor } from "@/lib/staff/require";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = { ...pageMetadata({ title: "Search office supplies and stationery", description: "Search PaperSource Ghana for paper, pens, toner, printing materials and workplace essentials.", path: "/search" }), robots: { index: false, follow: true } };

type PageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: PageProps) {
  const { q = "" } = await searchParams;
  const [products, categories] = await Promise.all([q ? listProductCards({ query: q }) : Promise.resolve([]), listDivisionCategories()]);
  const recommendations = q && products.length === 0 ? await listFeaturedProductCards() : [];
  const staff = await readStaffActor();
  const canEdit = staff ? canAccessAdmin(staff.role, "products", "write") : false;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <Breadcrumbs items={[{ label: "Search" }]} />
      <div className="mt-8 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate">Catalogue search</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Find supplies that keep work moving.</h1>
      </div>
      <p className="mt-4 max-w-2xl text-base text-slate sm:text-lg">
        Search paper, toner, pens, brands or SKU.
      </p>
      <div className="mt-7 max-w-3xl rounded-2xl border border-border/80 bg-card p-3 shadow-[0_8px_28px_rgba(16,42,67,0.06)] sm:p-4">
        <HeaderSearch
          key={q}
          className="block w-full"
          defaultQuery={q}
          inputId="catalogue-search"
        />
      </div>
      <RecentSearches query={q} />
      {!q ? <PopularCategories categories={categories} /> : null}
      {q ? (
        <div className="mt-12">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate">
              Results for <span className="text-ink">{q}</span>
            </h2>
            {products.length ? <p className="text-sm text-slate">{products.length} {products.length === 1 ? "product" : "products"}</p> : null}
          </div>
          <div className="mt-6">
            {products.length ? <ProductGridList products={products} canEdit={canEdit} /> : <div className="rounded-2xl border border-border bg-cream/60 p-6 sm:p-8"><h3 className="text-xl font-semibold text-ink">No exact matches yet</h3><p className="mt-2 max-w-xl text-slate">Try a broader term, browse a popular category, or start with these workplace essentials.</p><PopularCategories categories={categories} /><div className="mt-8">{recommendations.length ? <ProductGridList products={recommendations} canEdit={canEdit} /> : <p className="text-sm text-slate">Browse the full <Link href="/shop" className="font-medium text-ink underline underline-offset-4">catalogue</Link> to keep exploring.</p>}</div></div>}
          </div>
        </div>
      ) : null}
    </main>
  );
}
