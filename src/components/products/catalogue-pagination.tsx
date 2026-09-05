import Link from "next/link";

export function CataloguePagination({ page, totalPages, query }: { page: number; totalPages: number; query: Record<string, string> }) {
  if (totalPages <= 1) return null;
  const href = (next: number) => `/shop?${new URLSearchParams({ ...query, page: String(next) }).toString()}`;
  return <nav aria-label="Catalogue pages" className="mt-10 flex items-center justify-between gap-4 border-t border-border pt-5 text-sm"><span className="text-slate">Page {page} of {totalPages}</span><div className="flex gap-2">{page > 1 ? <Link href={href(page - 1)} className="rounded-lg border border-border px-4 py-2 font-medium text-ink transition hover:bg-cream">Previous</Link> : null}{page < totalPages ? <Link href={href(page + 1)} className="rounded-lg bg-ink px-4 py-2 font-medium text-white transition hover:bg-ink/90">Next</Link> : null}</div></nav>;
}
