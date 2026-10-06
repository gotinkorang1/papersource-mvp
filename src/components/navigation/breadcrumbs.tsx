import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export function Breadcrumbs({ items }: { items: Array<{ label: string; href?: string }> }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-8 min-w-0 overflow-x-auto text-sm text-slate">
      <ol className="flex min-w-max items-center gap-1.5" itemScope itemType="https://schema.org/BreadcrumbList">
        <li className="inline-flex shrink-0 items-center" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
          <Link href="/" itemProp="item" aria-label="Home" title="Home" className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md transition hover:bg-cream hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
            <Home className="size-4" aria-hidden />
            <span className="sr-only" itemProp="name">Home</span>
          </Link>
          <meta itemProp="position" content="1" />
        </li>
        {items.map((item, index) => (
          <li key={`${item.href ?? item.label}-${item.label}`} className="inline-flex min-w-0 shrink-0 items-center gap-1.5" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <ChevronRight className="size-3.5 shrink-0 text-slate/60" aria-hidden />
            {item.href ? <Link href={item.href} itemProp="item" title={item.label} className="inline-flex min-h-11 max-w-[min(70vw,28rem)] items-center truncate rounded-md px-1.5 transition hover:bg-cream hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"><span itemProp="name" className="truncate">{item.label}</span></Link> : <span aria-current="page" itemProp="name" className="inline-flex min-h-11 max-w-[min(70vw,28rem)] items-center truncate px-1.5 font-medium text-ink">{item.label}</span>}
            <meta itemProp="position" content={String(index + 2)} />
          </li>
        ))}
      </ol>
    </nav>
  );
}
