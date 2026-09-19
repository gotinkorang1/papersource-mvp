"use client";

import Link from "next/link";
import { Filter, Search, SlidersHorizontal, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState, useTransition } from "react";
import { CatalogueFilterSubmit } from "@/components/products/catalogue-filter-submit";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { CatalogueBrandView, CatalogueCategoryView } from "@/types/catalogue";

function PreservedInput({ name, value }: { name: string; value: string }) {
  return value ? <input type="hidden" name={name} value={value} /> : null;
}

function FilterFields({ availability, category, brand, sort, categories, brands }: { availability: string; category: string; brand: string; sort: string; categories: CatalogueCategoryView[]; brands: CatalogueBrandView[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <label className="grid gap-2 text-xs font-semibold tracking-[0.08em] text-slate uppercase">
        Availability
        <select name="availability" defaultValue={availability} aria-label="Filter by availability" className="h-12 min-w-0 rounded-xl border border-border bg-background px-3 text-base font-normal normal-case tracking-normal text-ink outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10 sm:text-sm">
          <option value="">Any stock level</option><option value="in_stock">In stock</option><option value="low">Low stock</option><option value="out">Out of stock</option>
        </select>
      </label>
      <label className="grid gap-2 text-xs font-semibold tracking-[0.08em] text-slate uppercase">
        Category
        <select name="category" defaultValue={category} aria-label="Filter by category" className="h-12 min-w-0 rounded-xl border border-border bg-background px-3 text-base font-normal normal-case tracking-normal text-ink outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10 sm:text-sm">
          <option value="">All categories</option>{categories.map((entry) => <option key={entry.slug} value={entry.slug}>{entry.name}</option>)}
        </select>
      </label>
      <label className="grid gap-2 text-xs font-semibold tracking-[0.08em] text-slate uppercase">
        Brand
        <select name="brand" defaultValue={brand} aria-label="Filter by brand" className="h-12 min-w-0 rounded-xl border border-border bg-background px-3 text-base font-normal normal-case tracking-normal text-ink outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10 sm:text-sm">
          <option value="">All brands</option>{brands.map((entry) => <option key={entry.slug} value={entry.slug}>{entry.name}</option>)}
        </select>
      </label>
      <label className="grid gap-2 text-xs font-semibold tracking-[0.08em] text-slate uppercase">
        Sort by
        <select name="sort" defaultValue={sort} aria-label="Sort catalogue" className="h-12 min-w-0 rounded-xl border border-border bg-background px-3 text-base font-normal normal-case tracking-normal text-ink outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10 sm:text-sm">
          <option value="featured">Featured</option><option value="name-asc">Name: A–Z</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option>
        </select>
      </label>
    </div>
  );
}

export function CatalogueToolbar({ count, query = "", category = "", brand = "", sort = "featured", availability = "", zone = "", view = "", categories, brands }: { count: number; query?: string; category?: string; brand?: string; sort?: string; categories: CatalogueCategoryView[]; brands: CatalogueBrandView[]; availability?: string; zone?: string; view?: string }) {
  const router = useRouter();
  const [filterOpen, setFilterOpen] = useState(false);
  const [isNavigating, startNavigation] = useTransition();
  const submitCleanCatalogueForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    for (const [name, value] of new FormData(event.currentTarget).entries()) {
      if (typeof value === "string" && value.trim()) params.set(name, value.trim());
    }
    const queryString = params.toString();
    setFilterOpen(false);
    startNavigation(() => router.push(queryString ? `/shop?${queryString}` : "/shop"));
  };
  const activeFilterCount = [query, category, brand, availability, sort !== "featured" ? sort : ""].filter(Boolean).length;
  const hasFilters = Boolean(query || activeFilterCount);
  const activeLabels = [
    query ? { key: "q", label: `Search: ${query}` } : null,
    category ? { key: "category", label: `Category: ${categories.find((entry) => entry.slug === category)?.name ?? category}` } : null,
    brand ? { key: "brand", label: `Brand: ${brands.find((entry) => entry.slug === brand)?.name ?? brand}` } : null,
    availability ? { key: "availability", label: `Stock: ${availability.replace("_", " ")}` } : null,
    sort !== "featured" ? { key: "sort", label: `Sort: ${sort.replaceAll("-", " ")}` } : null,
  ].filter((label): label is { key: string; label: string } => Boolean(label));
  const currentParams = new URLSearchParams();
  if (query) currentParams.set("q", query);
  if (category) currentParams.set("category", category);
  if (brand) currentParams.set("brand", brand);
  if (availability) currentParams.set("availability", availability);
  if (sort !== "featured") currentParams.set("sort", sort);
  if (zone) currentParams.set("zone", zone);
  if (view) currentParams.set("view", view);
  const clearFilterHref = (key: string) => {
    const params = new URLSearchParams(currentParams);
    params.delete(key);
    params.delete("page");
    const queryString = params.toString();
    return queryString ? `/shop?${queryString}` : "/shop";
  };
  const clearAllHref = () => {
    const params = new URLSearchParams(currentParams);
    ["q", "category", "brand", "availability", "sort", "zone", "page"].forEach((key) => params.delete(key));
    const queryString = params.toString();
    return queryString ? `/shop?${queryString}` : "/shop";
  };

  return (
    <section className="rounded-2xl border border-border/80 bg-card p-3 shadow-[0_8px_28px_rgba(16,42,67,0.06)] sm:p-4" aria-label="Catalogue filters">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0"><p className="truncate text-sm font-semibold text-ink">Find the right supplies</p><p className="mt-0.5 hidden text-xs text-slate sm:block">Search the catalogue, then refine when you need to.</p></div>
        <p className="shrink-0 rounded-full bg-cream px-2.5 py-1 text-xs font-semibold text-slate" aria-live="polite">{count} {count === 1 ? "result" : "results"}</p>
      </div>

      <div className="flex min-w-0 items-end gap-2">
        <form method="get" onSubmit={submitCleanCatalogueForm} className="flex min-w-0 flex-1 items-end gap-2" role="search">
          <label className="grid min-w-0 flex-1 gap-1.5 text-xs font-semibold tracking-[0.08em] text-slate uppercase"><span className="sr-only">Find in catalogue</span><span className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate" aria-hidden="true" /><input type="search" enterKeyHint="search" autoComplete="off" name="q" defaultValue={query} placeholder="Paper, pens, SKU..." aria-label="Search catalogue" className="h-11 w-full min-w-0 rounded-xl border border-border bg-background pl-9 pr-3 text-base font-normal normal-case tracking-normal text-ink outline-none transition placeholder:text-slate/70 focus:border-ink focus:ring-2 focus:ring-ink/10 sm:text-sm" /></span></label>
          <PreservedInput name="category" value={category} /><PreservedInput name="brand" value={brand} /><PreservedInput name="availability" value={availability} /><PreservedInput name="sort" value={sort !== "featured" ? sort : ""} /><PreservedInput name="zone" value={zone} /><PreservedInput name="view" value={view} />
          <button type="submit" disabled={isNavigating} className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-ink px-3 text-sm font-semibold text-white transition hover:bg-ink/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-wait disabled:opacity-70 dark:bg-ochre dark:text-ink dark:hover:bg-ochre/90 sm:px-4"><span className="sr-only sm:not-sr-only">{isNavigating ? "Searching" : "Search"}</span><Search className="size-4 sm:hidden" aria-hidden="true" /></button>
        </form>
        <button type="button" onClick={() => setFilterOpen(true)} aria-label={`Filters and sort${activeFilterCount ? `, ${activeFilterCount} active` : ""}`} aria-haspopup="dialog" aria-expanded={filterOpen} className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 text-sm font-semibold text-ink transition hover:border-ink hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:px-4"><SlidersHorizontal className="size-4" aria-hidden="true" /><span className="hidden sm:inline">Filters &amp; sort</span><span className="sm:hidden">Filter</span>{activeFilterCount ? <span className="grid size-5 place-items-center rounded-full bg-ink text-[0.68rem] text-white dark:bg-ochre dark:text-ink">{activeFilterCount}</span> : null}</button>
      </div>

      {activeLabels.length ? <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Active catalogue filters">{activeLabels.map(({ key, label }) => <li key={key} className="min-h-9 rounded-full border border-border bg-cream px-3 py-1 text-xs font-medium text-slate"><Link href={clearFilterHref(key)} aria-label={`Remove ${key === "q" ? "search" : key} filter`} className="inline-flex min-h-7 items-center rounded-sm outline-none transition hover:text-ink hover:underline focus-visible:ring-2 focus-visible:ring-ink/30">{label}<span aria-hidden="true" className="ml-1.5">×</span></Link></li>)}</ul> : null}
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/70 pt-3 text-xs text-slate"><p><span className="font-semibold text-ink">{count}</span> {count === 1 ? "product" : "products"}</p>{hasFilters ? <Link href={clearAllHref()} className="rounded-md px-2 py-1 font-medium text-ink underline-offset-4 transition hover:bg-cream hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Clear filters</Link> : null}</div>

      <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
        <SheetContent side="right" showCloseButton={false} className="inset-0 h-dvh w-full max-w-none gap-0 overflow-y-auto border-0 bg-card p-0 sm:max-w-none">
          <SheetHeader className="border-b border-border px-5 py-4 sm:px-8 sm:py-5"><div className="mx-auto flex w-full max-w-3xl items-start justify-between gap-4"><div><SheetTitle className="flex items-center gap-2 text-xl text-ink"><Filter className="size-5" aria-hidden="true" /> Filters and sorting</SheetTitle><SheetDescription className="mt-1 text-sm text-slate">Refine the catalogue, then apply all changes together. {count} {count === 1 ? "product currently matches" : "products currently match"} these settings.</SheetDescription></div><SheetClose render={<button type="button" aria-label="Close filters" className="grid size-10 shrink-0 place-items-center rounded-full border border-border text-ink transition hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink" />}><X className="size-5" aria-hidden="true" /></SheetClose></div></SheetHeader>
          <form method="get" onSubmit={submitCleanCatalogueForm} className="mx-auto grid w-full max-w-3xl gap-7 px-5 py-6 sm:px-8 sm:py-8">
            <label className="grid gap-2 text-xs font-semibold tracking-[0.08em] text-slate uppercase">Find in catalogue<input type="search" enterKeyHint="search" autoComplete="off" name="q" defaultValue={query} placeholder="Paper, pens, SKU..." aria-label="Search catalogue in filters" className="h-12 w-full rounded-xl border border-border bg-background px-3 text-base font-normal normal-case tracking-normal text-ink outline-none transition placeholder:text-slate/70 focus:border-ink focus:ring-2 focus:ring-ink/10 sm:text-sm" /></label>
            <PreservedInput name="zone" value={zone} /><PreservedInput name="view" value={view} />
            <FilterFields availability={availability} category={category} brand={brand} sort={sort} categories={categories} brands={brands} />
            <SheetFooter className="sticky bottom-0 flex-row justify-end border-t border-border bg-card/95 p-0 pt-4 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-[backdrop-filter]:bg-card/80">{hasFilters ? <Link href={clearAllHref()} onClick={() => setFilterOpen(false)} className="inline-flex h-11 items-center rounded-xl px-4 text-sm font-semibold text-slate underline-offset-4 hover:text-ink hover:underline">Clear all</Link> : null}<CatalogueFilterSubmit idleLabel="Apply filters" pendingLabel="Applying filters…" externalPending={isNavigating} className="sm:w-auto sm:min-w-36" /></SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </section>
  );
}
