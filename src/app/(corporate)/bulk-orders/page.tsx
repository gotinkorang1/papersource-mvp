import type { Metadata } from "next";
import Link from "next/link";
import { paperButton } from "@/components/commerce/paper-button";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { breadcrumbJsonLd } from "@/features/catalogue";
import { absoluteUrl, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Bulk stationery supplier in Ghana | Accra and Tema", description: "Request bulk paper, printer toner and workplace packs for Accra and Tema. Nationwide supply is arranged on request with delivery confirmed before charging.", path: "/bulk-orders", keywords: ["bulk stationery supplier Ghana", "bulk paper Accra", "bulk office supplies Tema", "procurement stationery Ghana"] });

export default function BulkOrdersPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 md:py-16 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([{ name: "Home", href: "/" }, { name: "Bulk orders", href: "/bulk-orders" }], absoluteUrl("/"))) }} />
      <Breadcrumbs items={[{ label: "Bulk orders" }]} />
      <div className="max-w-3xl rounded-3xl border border-border bg-muted/30 p-6 sm:p-10">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-paper-green">Procurement</p>
      <h1 className="mt-3 font-heading text-4xl font-semibold tracking-tight text-ink md:text-6xl">Bulk orders, planned clearly.</h1>
      <p className="mt-5 text-lg leading-8 text-slate">
        One catalogue for a single ream or a school year. Paste SKUs into Quick
        Order, or browse and add lines to the quote basket. Sales prices the
        list; Accra and Tema delivery is calculated; other regions stay on
        request.
      </p>
      <p className="mt-3 leading-7 text-slate">
        Office packs — new hire, small office, and classroom — are ready if you
        need a first order without building every line.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/quick-order" className={paperButton({ variant: "quote" })}>
          Quick Order
        </Link>
        <Link href="/request-quote" className={paperButton({ variant: "secondary" })}>
          Request a quotation
        </Link>
      </div>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[['Office restock', 'Paper, toner and everyday supplies for recurring workplace needs.'], ['Schools and organisations', 'Build a clear list for classrooms, teams and programmes.'], ['Nationwide supply', 'We confirm the best delivery option and cost before charging.']].map(([title, body]) => <div key={title} className="rounded-2xl border border-border bg-card p-5 shadow-sm"><h2 className="font-heading text-lg font-semibold text-ink">{title}</h2><p className="mt-2 text-sm leading-6 text-slate">{body}</p></div>)}
      </div>
    </main>
  );
}
