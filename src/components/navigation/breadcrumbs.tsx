import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export function Breadcrumbs({ items }: { items: Array<{ label: string; href?: string }> }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-1.5 overflow-x-auto text-sm text-slate">
      <Link href="/" aria-label="Home" className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md transition hover:bg-cream hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"><Home className="size-4" aria-hidden /></Link>
      {items.map((item) => (
        <span key={`${item.href ?? item.label}-${item.label}`} className="inline-flex shrink-0 items-center gap-1.5">
          <ChevronRight className="size-3.5 text-slate/60" aria-hidden />
          {item.href ? <Link href={item.href} className="inline-flex min-h-11 items-center rounded-md px-1.5 transition hover:bg-cream hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">{item.label}</Link> : <span aria-current="page" className="inline-flex min-h-11 items-center px-1.5 font-medium text-ink">{item.label}</span>}
        </span>
      ))}
    </nav>
  );
}
