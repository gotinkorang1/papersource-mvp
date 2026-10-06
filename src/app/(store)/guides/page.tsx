import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { breadcrumbJsonLd } from "@/features/catalogue";
import { SEO_GUIDES } from "@/features/content/seo-guides";
import { absoluteUrl, collectionPageJsonLd, collectionItemPosition, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Ghana office and stationery buying guides",
  description: "Practical buying guides for office supplies, school stationery, paper, printer toner, delivery and procurement in Ghana.",
  path: "/guides",
  keywords: ["office supplies Ghana guide", "stationery buying guide Ghana", "school stationery Ghana"],
});

export default function GuidesPage() {
  const guideUrl = absoluteUrl("/guides");
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-16 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageJsonLd({ name: "Ghana office and stationery buying guides", description: "Practical buying guides for office supplies, school stationery, paper, printer toner, delivery and procurement in Ghana.", url: guideUrl, totalItems: SEO_GUIDES.length, items: SEO_GUIDES.map((guide, index) => ({ name: guide.title, url: absoluteUrl(`/guides/${guide.slug}`), position: collectionItemPosition(1, SEO_GUIDES.length, index) })) })) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([{ name: "Guides", href: "/guides" }], absoluteUrl("/"))) }} />
      <Breadcrumbs items={[{ label: "Guides" }]} />
      <div className="max-w-3xl">
        <p className="text-sm uppercase tracking-[0.16em] text-slate">PaperSource Ghana</p>
        <h1 className="mt-3 font-heading text-4xl font-semibold tracking-tight text-ink md:text-6xl">Practical buying guides</h1>
        <p className="mt-5 text-lg leading-relaxed text-slate">Clear advice for offices, schools, organisations and individuals sourcing stationery and workplace supplies in Ghana.</p>
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {SEO_GUIDES.map((guide) => (
          <article key={guide.slug} className="rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <h2 className="font-heading text-2xl text-ink"><Link href={`/guides/${guide.slug}`} className="underline-offset-4 hover:underline">{guide.title}</Link></h2>
            <p className="mt-3 leading-relaxed text-slate">{guide.description}</p>
            <Link href={`/guides/${guide.slug}`} className="mt-5 inline-flex min-h-11 items-center font-semibold text-ink underline underline-offset-4">Read guide</Link>
          </article>
        ))}
      </div>
    </main>
  );
}
