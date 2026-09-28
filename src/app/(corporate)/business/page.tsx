import type { Metadata } from "next";
import Link from "next/link";
import { paperButton } from "@/components/commerce/paper-button";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { breadcrumbJsonLd } from "@/features/catalogue";
import { absoluteUrl, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Business stationery supplier in Accra, Tema and Ghana", description: "PaperSource supplies Ghanaian offices with A4 paper, printer toner and stationery. Build a bulk quote for Accra and Tema delivery while keeping retail checkout separate.", path: "/business", keywords: ["business stationery supplier Accra", "office supplies Tema", "corporate stationery Ghana", "bulk office supplies Ghana"] });

export default function BusinessPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 md:py-16 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([{ name: "Home", href: "/" }, { name: "Business", href: "/business" }], absoluteUrl("/"))) }} />
      <Breadcrumbs items={[{ label: "Business" }]} />
      <div className="max-w-3xl rounded-3xl border border-border bg-muted/30 p-6 sm:p-10">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-paper-green">Business procurement</p>
      <h1 className="mt-3 font-heading text-4xl font-semibold tracking-tight text-ink md:text-6xl">Procurement without a second catalogue.</h1>
      <p className="mt-5 text-lg leading-8 text-slate">
        Build a quote list from the same products a colleague can buy at the
        published price. WhatsApp is for questions — Submit and Accept stay on
        the site.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/quick-order" className={paperButton({ variant: "quote" })}>
          Start with SKUs
        </Link>
        <Link href="/quote" className={paperButton({ variant: "secondary" })}>
          Open quote list
        </Link>
      </div>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[['01', 'Build a list', 'Add products from the catalogue or paste known SKUs.'], ['02', 'Request pricing', 'Share quantities and delivery details with our team.'], ['03', 'Approve and order', 'Review the quote, accept it, then pay securely.']].map(([step, title, body]) => <div key={step} className="rounded-2xl border border-border bg-card p-5 shadow-sm"><span className="text-xs font-semibold tracking-[0.16em] text-paper-green">{step}</span><h2 className="mt-4 font-heading text-lg font-semibold text-ink">{title}</h2><p className="mt-2 text-sm leading-6 text-slate">{body}</p></div>)}
      </div>
    </main>
  );
}
