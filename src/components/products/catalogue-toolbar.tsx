import Link from "next/link";
import { CatalogueFilterSubmit } from "@/components/products/catalogue-filter-submit";
import type { CatalogueBrandView, CatalogueCategoryView } from "@/types/catalogue";

export function CatalogueToolbar({
  count,
  query = "",
  category = "",
  brand = "",
  sort = "featured",
  availability = "",
  categories,
  brands,
}: {
  count: number;
  query?: string;
  category?: string;
  brand?: string;
  sort?: string;
  categories: CatalogueCategoryView[];
  brands: CatalogueBrandView[];
  availability?: string;
}) {
  const hasFilters = Boolean(query || category || brand || availability || sort !== "featured");
  const activeLabels = [
    query ? `Search: ${query}` : null,
    category ? `Category: ${categories.find((entry) => entry.slug === category)?.name ?? category}` : null,
    brand ? `Brand: ${brands.find((entry) => entry.slug === brand)?.name ?? brand}` : null,
    availability ? `Stock: ${availability.replace("_", " ")}` : null,
    sort !== "featured" ? `Sort: ${sort.replaceAll("-", " ")}` : null,
  ].filter((label): label is string => Boolean(label));

  return (
    <section className="rounded-2xl border border-border/80 bg-card p-4 shadow-[0_8px_28px_rgba(16,42,67,0.06)] sm:p-5" aria-label="Catalogue filters">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink">Find the right supplies</p>
          <p className="mt-1 text-sm text-slate">Refine the catalogue by stock, category, brand, or price.</p>
        </div>
        <p className="rounded-full bg-cream px-3 py-1 text-xs font-semibold text-slate" aria-live="polite">
          {count} {count === 1 ? "result" : "results"}
        </p>
      </div>
      <form method="get" className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="grid min-w-0 gap-1.5 text-xs font-medium tracking-[0.08em] text-slate uppercase sm:col-span-2 lg:col-span-3 xl:col-span-1">
          Find in catalogue
          <input
            name="q"
            defaultValue={query}
            placeholder="Paper, pens, SKU..."
            aria-label="Search catalogue"
            className="h-11 min-w-0 rounded-lg border border-border bg-cream px-3 text-sm font-normal normal-case tracking-normal text-ink outline-none transition placeholder:text-slate/70 focus:border-ink focus:bg-card focus:ring-2 focus:ring-ink/10"
          />
        </label>
        <details className="rounded-xl border border-border/70 bg-cream/40 p-3 sm:col-span-2 lg:col-span-3" defaultOpen={hasFilters}>
          <summary className="cursor-pointer list-none text-sm font-semibold text-ink marker:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
            <span className="inline-flex items-center gap-2"><span aria-hidden>＋</span> More filters and sorting</span>
          </summary>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 xl:items-end">
            <label className="grid gap-1.5 text-xs font-medium tracking-[0.08em] text-slate uppercase">
              Availability
              <select name="availability" defaultValue={availability} aria-label="Filter by availability" className="h-11 min-w-0 rounded-lg border border-border bg-cream px-3 text-sm font-normal normal-case tracking-normal text-ink outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"><option value="">Any stock level</option><option value="in_stock">In stock</option><option value="low">Low stock</option><option value="out">Out of stock</option></select>
            </label>
            <label className="grid gap-1.5 text-xs font-medium tracking-[0.08em] text-slate uppercase">
              Category
              <select name="category" defaultValue={category} aria-label="Filter by category" className="h-11 min-w-0 rounded-lg border border-border bg-cream px-3 text-sm font-normal normal-case tracking-normal text-ink outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"><option value="">All categories</option>{categories.map((entry) => <option key={entry.slug} value={entry.slug}>{entry.name}</option>)}</select>
            </label>
            <label className="grid gap-1.5 text-xs font-medium tracking-[0.08em] text-slate uppercase">
              Brand
              <select name="brand" defaultValue={brand} aria-label="Filter by brand" className="h-11 min-w-0 rounded-lg border border-border bg-cream px-3 text-sm font-normal normal-case tracking-normal text-ink outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"><option value="">All brands</option>{brands.map((entry) => <option key={entry.slug} value={entry.slug}>{entry.name}</option>)}</select>
            </label>
            <label className="grid gap-1.5 text-xs font-medium tracking-[0.08em] text-slate uppercase">
              Sort by
              <select name="sort" defaultValue={sort} aria-label="Sort catalogue" className="h-11 min-w-0 rounded-lg border border-border bg-cream px-3 text-sm font-normal normal-case tracking-normal text-ink outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"><option value="featured">Featured</option><option value="name-asc">Name: A–Z</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option></select>
            </label>
            <CatalogueFilterSubmit />
          </div>
        </details>
      </form>
      {activeLabels.length ? <ul className="mt-4 flex flex-wrap gap-2" aria-label="Active catalogue filters">
        {activeLabels.map((label) => <li key={label} className="rounded-full border border-border bg-cream px-3 py-1 text-xs font-medium text-slate">{label}</li>)}
      </ul> : null}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-4 text-sm text-slate">
        <p><span className="font-semibold text-ink">{count}</span> {count === 1 ? "product" : "products"}</p>
        {hasFilters ? <Link href="/shop" className="rounded-md px-2 py-1 font-medium text-ink underline-offset-4 transition hover:bg-cream hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Clear filters</Link> : null}
      </div>
    </section>
  );
}
