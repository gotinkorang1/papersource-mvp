import Link from "next/link";
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
  return (
    <section className="rounded-2xl border border-border/80 bg-card p-4 shadow-[0_8px_28px_rgba(16,42,67,0.06)] sm:p-5" aria-label="Catalogue filters">
      <form method="get" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[minmax(15rem,1.4fr)_repeat(4,minmax(8rem,1fr))_auto] xl:items-end">
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
          Availability
          <select name="availability" defaultValue={availability} className="h-11 rounded-lg border border-border bg-cream px-3 text-sm font-normal normal-case tracking-normal text-ink outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10">
            <option value="">Any stock level</option><option value="in_stock">In stock</option><option value="low">Low stock</option><option value="out">Out of stock</option>
          </select>
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
        <button type="submit" className="h-11 rounded-lg bg-ink px-5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(16,42,67,0.14)] transition hover:-translate-y-0.5 hover:bg-ink/90 hover:shadow-[0_8px_18px_rgba(16,42,67,0.2)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
          Apply
        </button>
      </form>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-4 text-sm text-slate">
        <p><span className="font-semibold text-ink">{count}</span> {count === 1 ? "product" : "products"}</p>
        {query || category || brand || sort !== "featured" || availability ? <Link href="/shop" className="font-medium text-ink underline-offset-4 hover:underline">Clear filters</Link> : null}
      </div>
    </section>
  );
}
