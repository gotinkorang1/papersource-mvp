import Link from "next/link";
import type { CatalogueCategoryView } from "@/types/catalogue";

export function PopularCategories({ categories }: { categories: CatalogueCategoryView[] }) {
  return <section className="mt-8 rounded-2xl border border-border bg-cream/60 p-5"><p className="text-xs font-semibold tracking-[0.14em] text-slate uppercase">Popular categories</p><div className="mt-3 flex flex-wrap gap-2">{categories.slice(0, 8).map((category) => <Link key={category.slug} href={`/shop?category=${category.slug}`} className="rounded-full border border-border bg-card px-3 py-2 text-sm font-medium text-ink transition hover:-translate-y-0.5 hover:border-ink">{category.name}</Link>)}</div></section>;
}
