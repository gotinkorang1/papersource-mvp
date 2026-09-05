import Link from "next/link";
import type { CatalogueBrandView, CatalogueCategoryView } from "@/types/catalogue";

export function CatalogueToolbar({
  count,
  query = "",
  category = "",
  brand = "",
  sort = "featured",
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
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5" aria-label="Catalogue filters">
      <form method="get" className="grid gap-3 lg:grid-cols-[minmax(15rem,1fr)_12rem_12rem_12rem_auto] lg:items-end">
        <label className="grid gap-1.5 text-xs font-medium tracking-[0.08em] text-slate uppercase">
          Find in catalogue
          <input
            name="q"
            defaultValue={query}
            placeholder="Paper, pens, SKU..."
            className="h-11 rounded-lg border border-border bg-cream px-3 text-sm font-normal normal-case tracking-normal text-ink outline-none transition focus:border-ink focus:bg-card focus:ring-2 focus:ring-ink/10"
          />
        </label>
        <label className="grid gap-1.5 text-xs font-medium tracking-[0.08em] text-slate uppercase">
          Category
          <select name="category" defaultValue={category} className="h-11 rounded-lg border border-border bg-cream px-3 text-sm font-normal normal-case tracking-normal text-ink outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10">
            <option value="">All categories</option>
            {categories.map((entry) => <option key={entry.slug} value={entry.slug}>{entry.name}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5 text-xs font-medium tracking-[0.08em] text-slate uppercase">
          Brand
          <select name="brand" defaultValue={brand} className="h-11 rounded-lg border border-border bg-cream px-3 text-sm font-normal normal-case tracking-normal text-ink outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10">
            <option value="">All brands</option>
            {brands.map((entry) => <option key={entry.slug} value={entry.slug}>{entry.name}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5 text-xs font-medium tracking-[0.08em] text-slate uppercase">
          Sort by
          <select name="sort" defaultValue={sort} className="h-11 rounded-lg border border-border bg-cream px-3 text-sm font-normal normal-case tracking-normal text-ink outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10">
            <option value="featured">Featured</option>
            <option value="name-asc">Name: A–Z</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </label>
        <button type="submit" className="h-11 rounded-lg bg-ink px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-ink/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
          Apply
        </button>
      </form>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-4 text-sm text-slate">
        <p><span className="font-semibold text-ink">{count}</span> {count === 1 ? "product" : "products"}</p>
        {query || category || brand || sort !== "featured" ? <Link href="/shop" className="font-medium text-ink underline-offset-4 hover:underline">Clear filters</Link> : null}
      </div>
    </section>
  );
}
