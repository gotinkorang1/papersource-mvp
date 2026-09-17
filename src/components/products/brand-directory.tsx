"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BrandLogo } from "@/components/marketing/brand-logo";
import { filterAndSortBrands, type BrandDirectoryItem } from "./brand-directory-model";

export function BrandDirectory({ brands }: { brands: BrandDirectoryItem[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const categories = useMemo(
    () => [...new Map(brands.flatMap((brand) => brand.categories).map((entry) => [entry.slug, entry])).values()].sort((a, b) => a.name.localeCompare(b.name)),
    [brands],
  );
  const filteredBrands = filterAndSortBrands(brands, { query, category, sort: "name" });

  return (
    <>
      <div className="mt-8 grid gap-3 rounded-xl border border-border bg-cream/60 p-4 sm:grid-cols-[minmax(0,1fr)_minmax(12rem,16rem)]">
        <label className="grid gap-1 text-sm font-medium text-ink">
          Find a brand
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by brand name" className="h-11 rounded-lg border border-border bg-card px-3 font-normal outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10" />
        </label>
        <label className="grid gap-1 text-sm font-medium text-ink">
          Category
          <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-11 rounded-lg border border-border bg-card px-3 font-normal outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10">
            <option value="">All categories</option>
            {categories.map((entry) => <option key={entry.slug} value={entry.slug}>{entry.name}</option>)}
          </select>
        </label>
      </div>
      <p className="mt-4 text-sm text-slate" aria-live="polite">Showing {filteredBrands.length} {filteredBrands.length === 1 ? "brand" : "brands"}</p>
      {filteredBrands.length ? (
        <ul className="mt-4 grid gap-px bg-border sm:grid-cols-2 md:grid-cols-3">
          {filteredBrands.map((brand) => (
            <li key={brand.id} className="bg-card">
              <Link href={`/brands/${brand.slug}`} className="block min-h-28 px-5 py-6 transition-colors hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ink">
                <BrandLogo name={brand.name} />
                <p className="mt-2 text-xs text-slate">{brand.categories.map((entry) => entry.name).join(" · ")}</p>
              </Link>
            </li>
          ))}
        </ul>
      ) : <p className="mt-4 rounded-xl border border-dashed border-border p-8 text-center text-sm text-slate">No brands match those filters.</p>}
    </>
  );
}
