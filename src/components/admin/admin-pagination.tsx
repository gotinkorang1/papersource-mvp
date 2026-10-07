import Link from "next/link";

export function AdminPagination({
  pathname,
  params,
  page,
  hasNext,
}: {
  pathname: string;
  params: Record<string, string | undefined>;
  page: number;
  hasNext: boolean;
}) {
  if (page === 1 && !hasNext) return null;

  const hrefFor = (nextPage: number) => {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value) search.set(key, value);
    }
    if (nextPage > 1) search.set("page", String(nextPage));
    else search.delete("page");
    const query = search.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  return (
    <nav aria-label="Pagination" className="mt-4 flex items-center justify-between gap-3 text-sm text-slate">
      <span>Page {page}</span>
      <div className="flex items-center gap-2">
        {page > 1 ? <Link href={hrefFor(page - 1)} className="rounded-md border border-border px-3 py-2 font-medium text-ink hover:bg-muted">Previous</Link> : null}
        {hasNext ? <Link href={hrefFor(page + 1)} className="rounded-md border border-border px-3 py-2 font-medium text-ink hover:bg-muted">Next</Link> : null}
      </div>
    </nav>
  );
}
