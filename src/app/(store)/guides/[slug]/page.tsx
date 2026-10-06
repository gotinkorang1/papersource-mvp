import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { SEO_GUIDES, SEO_GUIDES_UPDATED_AT, SEO_GUIDE_SLUGS, getSeoGuide, seoGuideUrl } from "@/features/content/seo-guides";
import { breadcrumbJsonLd } from "@/features/catalogue";
import { pageMetadata, webPageJsonLd } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return SEO_GUIDE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const guide = getSeoGuide((await params).slug);
  if (!guide) return { title: "Guide not found", robots: { index: false, follow: false } };
  return pageMetadata({ title: guide.title, description: guide.description, path: `/guides/${guide.slug}`, keywords: ["Ghana", "Accra", "Tema", "office supplies", "stationery"] });
}

export default async function GuidePage({ params }: Props) {
  const guide = getSeoGuide((await params).slug);
  if (!guide) notFound();
  const url = seoGuideUrl(guide.slug);
  const relatedGuides = SEO_GUIDES.filter((candidate) => candidate.slug !== guide.slug).slice(0, 3);
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 md:py-16 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd({ name: guide.title, description: guide.description, url, dateModified: SEO_GUIDES_UPDATED_AT })) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Article", headline: guide.title, description: guide.description, url, datePublished: SEO_GUIDES_UPDATED_AT, dateModified: SEO_GUIDES_UPDATED_AT, inLanguage: "en-GH", isPartOf: { "@id": `${url.split("/guides/")[0]}/#website` }, author: { "@type": "Organization", name: "PaperSource Ghana" }, publisher: { "@type": "Organization", name: "PaperSource Ghana" } }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([{ name: "Guides", href: "/guides" }, { name: guide.title, href: `/guides/${guide.slug}` }], url.split("/guides/")[0])) }} />
      <Breadcrumbs items={[{ label: "Guides", href: "/guides" }, { label: guide.title }]} />
      <p className="text-sm uppercase tracking-[0.16em] text-slate">PaperSource Ghana guide</p>
      <h1 className="mt-3 font-heading text-4xl font-semibold tracking-tight text-ink md:text-6xl">{guide.title}</h1>
      <p className="mt-5 max-w-3xl text-lg leading-relaxed text-slate">{guide.intro}</p>
      <p className="mt-3 text-xs text-slate">Reviewed {new Date(SEO_GUIDES_UPDATED_AT).toLocaleDateString("en-GH", { dateStyle: "long" })}</p>
      <div className="mt-10 space-y-9">
        {guide.sections.map((section) => <section key={section.heading}><h2 className="font-heading text-2xl text-ink md:text-3xl">{section.heading}</h2><div className="mt-3 space-y-3 text-base leading-8 text-slate md:text-lg">{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></section>)}
      </div>
      <section className="mt-12 rounded-2xl border border-border bg-cream/60 p-6">
        <h2 className="font-heading text-2xl text-ink">Continue with PaperSource</h2>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">{guide.links.map((link) => <Link key={link.href} href={link.href} className="min-h-11 inline-flex items-center font-semibold text-ink underline underline-offset-4">{link.label}</Link>)}</div>
      </section>
      <section className="mt-10 border-t border-border pt-8" aria-labelledby="related-guides">
        <h2 id="related-guides" className="font-heading text-2xl text-ink">More Ghana buying guides</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">{relatedGuides.map((related) => <Link key={related.slug} href={`/guides/${related.slug}`} className="rounded-xl border border-border bg-card p-4 text-sm font-semibold leading-6 text-ink transition hover:-translate-y-0.5 hover:shadow-sm">{related.title}</Link>)}</div>
      </section>
    </main>
  );
}
