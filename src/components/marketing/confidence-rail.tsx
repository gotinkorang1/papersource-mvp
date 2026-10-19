import Link from "next/link";
import { ArrowUpRight, BadgeCheck, PackageCheck, Store, Truck } from "lucide-react";

const confidenceItems = [
  { icon: Store, label: "Shop pickup", detail: "Free collection", href: "/delivery" },
  { icon: Truck, label: "Accra & Tema", detail: "Reliable delivery", href: "/delivery" },
  { icon: BadgeCheck, label: "VAT included", detail: "Clear prices", href: "/shop" },
  { icon: PackageCheck, label: "Bulk support", detail: "Quotes for teams", href: "/request-quote" },
] as const;

export function ConfidenceRail({ className = "" }: { className?: string }) {
  return (
    <nav aria-label="PaperSource shopping benefits" className={`paper-confidence-rail grid grid-cols-2 overflow-hidden rounded-2xl border border-border bg-card shadow-[0_12px_34px_rgba(43,50,49,0.06)] sm:grid-cols-4 ${className}`}>
      {confidenceItems.map(({ icon: Icon, label, detail, href }, index) => (
        <Link
          key={label}
          href={href}
          className={`paper-confidence-rail__item group flex min-h-24 items-center gap-3 p-4 transition-[background-color,transform] duration-300 hover:bg-muted/60 motion-safe:hover:-translate-y-0.5 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-ink sm:min-h-28 sm:p-5 ${index % 2 ? "border-l border-border" : ""} ${index > 1 ? "border-t border-border sm:border-t-0" : ""}`}
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-paper-green/10 text-paper-green transition-transform duration-300 group-hover:scale-105 group-hover:rotate-[-3deg]">
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-ink">{label}</span>
            <span className="mt-0.5 block text-xs text-slate">{detail}</span>
          </span>
          <ArrowUpRight className="ml-auto size-4 shrink-0 text-slate/60 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-paper-green" aria-hidden="true" />
        </Link>
      ))}
    </nav>
  );
}
