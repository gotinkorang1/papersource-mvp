import type { Metadata } from "next";
import { HeaderSearch } from "@/components/navigation/header-search";
import { ProductGridList } from "@/components/products/product-grid-list";
import { listProductCards } from "@/features/catalogue";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { listDivisionCategories, listFeaturedProductCards } from "@/features/catalogue";
import { PopularCategories } from "@/components/products/popular-categories";
import { RecentSearches } from "@/components/products/recent-searches";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false, follow: true },
};

type PageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: PageProps) {
  const { q = "" } = await searchParams;
  const [products, categories] = await Promise.all([q ? listProductCards({ query: q }) : Promise.resolve([]), listDivisionCategories()]);
  const recommendations = q && products.length === 0 ? await listFeaturedProductCards() : [];

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <Breadcrumbs items={[{ label: "Search" }]} />
      <h1 className="text-3xl text-ink">Search</h1>
      <p className="mt-3 text-slate">
        Search paper, toner, pens, brands or SKU.
      </p>
      <div className="mt-6">
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
        <div className="mt-10">
          <h2 className="text-sm tracking-[0.16em] text-slate uppercase">
            Results for {q}
          </h2>
          <div className="mt-6">
            {products.length ? <ProductGridList products={products} /> : <div className="rounded-2xl border border-border bg-cream/60 p-6"><h3 className="text-xl text-ink">No exact matches yet</h3><p className="mt-2 text-slate">Try a broader term, browse a popular category, or start with these workplace essentials.</p><PopularCategories categories={categories} /><div className="mt-8"><ProductGridList products={recommendations} /></div></div>}
          </div>
        </div>
      ) : null}
    </main>
  );
}
