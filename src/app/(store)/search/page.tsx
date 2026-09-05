import type { Metadata } from "next";
import { HeaderSearch } from "@/components/navigation/header-search";
import { ProductGridList } from "@/components/products/product-grid-list";
import { listProductCards } from "@/features/catalogue";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false, follow: true },
};

type PageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: PageProps) {
  const { q = "" } = await searchParams;
  const products = q ? await listProductCards({ query: q }) : [];

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
      {q ? (
        <div className="mt-10">
          <h2 className="text-sm tracking-[0.16em] text-slate uppercase">
            Results for {q}
          </h2>
          <div className="mt-6">
            <ProductGridList products={products} />
          </div>
        </div>
      ) : null}
    </main>
  );
}
