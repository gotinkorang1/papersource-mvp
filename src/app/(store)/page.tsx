import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { paperButton } from "@/components/commerce/paper-button";
import { CorporateBanner } from "@/components/marketing/corporate-banner";
import { CategoryTile } from "@/components/products/category-tile";
import { ProductGridList } from "@/components/products/product-grid-list";
import { Testimonials } from "@/components/marketing/testimonials";
import { LiveDeliveryStatus } from "@/components/marketing/live-delivery-status";
import { SocialActivitySection } from "@/components/marketing/social-activity-section";
import {
  listDivisionCategories,
  listFeaturedProductCards,
} from "@/features/catalogue";
import { SEO_GUIDES } from "@/features/content/seo-guides";
import { canAccessAdmin } from "@/lib/staff/rbac";
import { readStaffActor } from "@/lib/staff/require";
import { categoryImagesFor } from "@/features/catalogue/category-images";
import { absoluteUrl, pageMetadata, webPageJsonLd } from "@/lib/seo";
import { ArrowRight, BadgeCheck, Check, ClipboardList, Layers3, PackageCheck, Search, ShieldCheck, Store, Truck } from "lucide-react";

const WorkdayCarousel = dynamic(
  () => import("@/components/marketing/workday-carousel").then((module) => module.WorkdayCarousel),
  { loading: () => <div aria-hidden className="mx-auto h-[28rem] max-w-6xl px-4 py-14 sm:px-6 md:py-20 lg:px-8" /> },
);

export const metadata: Metadata = pageMetadata({
  title: "Office supplies and stationery in Ghana",
  description: "Shop paper, stationery, printing supplies and workplace essentials from PaperSource Ghana, with delivery across Accra and Tema and nationwide supply on request.",
  path: "/",
  keywords: ["office supplies Ghana", "stationery supplier Accra", "office supplies Tema", "bulk stationery Ghana"],
});

export default async function HomePage() {
  const categories = await listDivisionCategories();
  const categoryImages = categoryImagesFor(categories);
  const featured = await listFeaturedProductCards();
  const staff = await readStaffActor();
  const canEdit = staff ? canAccessAdmin(staff.role, "products", "write") : false;
  return (
    <main className="overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webPageJsonLd({
            name: "Office supplies and stationery in Ghana",
            description: "PaperSource Ghana supplies paper, stationery, printing supplies and workplace essentials across Accra and Tema.",
            url: absoluteUrl("/"),
          })),
        }}
      />
      <section className="paper-grain relative isolate mx-auto max-w-7xl overflow-hidden rounded-b-[2rem] border-x border-b border-border/70 px-4 py-8 shadow-[0_18px_55px_rgba(16,42,67,0.06)] sm:px-6 sm:py-14 md:px-8 md:py-20 lg:py-24">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 -z-10 size-72 rounded-full bg-ochre/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-24 -z-10 size-80 rounded-full bg-paper-green/10 blur-3xl" />
        <div className="grid items-center gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16">
          <div>
        <p className="inline-flex rounded-full border border-paper-green/25 bg-paper-green/10 px-3 py-1.5 text-[11px] font-semibold tracking-[0.16em] text-paper-green uppercase">
          Ghana&apos;s modern workplace supply partner
        </p>
        <h1 className="mt-5 max-w-3xl text-balance text-4xl font-semibold leading-[1.03] tracking-[-0.03em] text-ink motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 sm:text-5xl md:text-6xl lg:text-7xl">
          Everything your workplace needs.
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-slate sm:text-lg md:text-xl">
          Office stationery, A4 paper, printer toner and workplace essentials —
          supplied across Accra &amp; Tema for offices, schools and organisations.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link href="/shop" className={`${paperButton()} w-full sm:w-auto`}>
            Shop products <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link
            href="/request-quote"
            className={`${paperButton({ variant: "quote" })} w-full sm:w-auto`}
          >
            Request Bulk Quote
          </Link>
        </div>
        <p className="mt-5 text-sm text-slate">Nationwide supply available on request.</p>
        <LiveDeliveryStatus />
        <div className="mt-5 grid max-w-xl grid-cols-3 divide-x divide-border rounded-xl border border-border/80 bg-card/70 px-2 py-3 shadow-sm sm:max-w-lg sm:px-3">
          {[{ label: "Shop pickup", value: "Free", icon: Store }, { label: "Accra & Tema", value: "Delivery", icon: Truck }, { label: "Prices", value: "VAT included", icon: BadgeCheck }].map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center justify-center gap-2 px-2 text-left sm:px-3"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-paper-green/10 text-paper-green"><Icon className="size-3.5" aria-hidden="true" /></span><span><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate">{label}</p><p className="mt-0.5 text-xs font-semibold text-ink sm:text-sm">{value}</p></span></div>
          ))}
        </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] border border-border bg-cream shadow-[0_24px_60px_rgba(16,42,67,0.16)] ring-1 ring-ink/5">
            <Image src="/images/catalogue-stationery-generated.png" alt="Stationery, notebooks, paper and desk supplies arranged for a productive workday" fill priority loading="eager" fetchPriority="high" sizes="(max-width: 1024px) 100vw, 46vw" className="object-cover transition-transform duration-700 motion-safe:hover:scale-105" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-tr from-ink/20 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 rounded-xl border border-white/25 bg-ink/75 px-4 py-3 text-cream shadow-lg backdrop-blur-sm">
              <div><p className="text-[10px] font-semibold tracking-[0.14em] text-ochre uppercase">Ready for the workday</p><p className="mt-1 text-sm font-medium">Reliable stock. Thoughtful service.</p></div>
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ochre text-ink"><Check className="size-4" aria-hidden /></span>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="why-papersource" className="paper-section-wash mx-auto max-w-6xl rounded-3xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-paper-green">A better way to restock</p>
            <h2 id="why-papersource" className="paper-section-title mt-2 font-heading text-2xl tracking-tight text-ink sm:text-3xl">Everything your team needs, with less friction.</h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-slate">Clear prices for everyday orders, and a dedicated quote path when your requirements are larger.</p>
        </div>
        <div className="grid overflow-hidden rounded-2xl border border-border bg-card shadow-[0_14px_40px_rgba(16,42,67,0.06)] sm:grid-cols-3">
          {[
            { icon: Truck, title: "Delivery that keeps pace", body: "Accra and Tema delivery, with nationwide supply on request." },
            { icon: Layers3, title: "Retail or bulk", body: "Checkout everyday items or build a quote for larger requirements." },
            { icon: ShieldCheck, title: "A dependable partner", body: "Clear pricing, practical support and a team that follows through." },
          ].map(({ icon: Icon, title, body }, index) => (
            <div key={title} className={`paper-hover-lift group flex gap-3 p-5 transition-colors hover:bg-muted/40 sm:p-6 ${index > 0 ? "border-t border-border sm:border-l sm:border-t-0" : ""}`}>
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-paper-green/10 text-paper-green transition-transform duration-200 group-hover:scale-105"><Icon className="size-5" aria-hidden /></span>
              <div><p className="font-semibold text-ink">{title}</p><p className="mt-1 text-sm leading-6 text-slate">{body}</p></div>
            </div>
          ))}
        </div>
      </section>

      <WorkdayCarousel />

      <section className="paper-section-wash border-y border-border/80 bg-card py-14 sm:py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xs font-semibold tracking-[0.18em] text-paper-green uppercase">Shop by need</h2>
              <p className="paper-section-title mt-2 max-w-xl text-base font-medium text-ink sm:text-lg">Start with a category and find the supplies your team uses every day.</p>
            </div>
            <Link href="/shop" className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-ink underline underline-offset-4 transition hover:text-paper-green sm:inline-flex">Browse all <ArrowRight className="size-4" aria-hidden /></Link>
          </div>
          <div className="mt-7 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {categories.map((category, index) => {
              const image = categoryImages[index];
              return (
                <CategoryTile
                  key={category.slug}
                  name={category.name}
                  href={`/shop/${category.slug}`}
                  caption={category.caption}
                  imageSrc={image.src}
                  imageAlt={image.alt}
                  style={{ animationDelay: `${Math.min(index, 7) * 45}ms` }}
                />
              );
            })}
          </div>
          <Link href="/shop" className="mt-6 inline-flex text-sm font-semibold text-ink underline underline-offset-4 sm:hidden">Browse all products →</Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16 lg:px-8">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-cream shadow-[0_16px_40px_rgba(16,42,67,0.1)]">
          <Image src="/images/aerial-view-african-descent-woman-working-computer-white-table-office.jpg" alt="Organised workplace desk with stationery and computer" fill sizes="(max-width: 1024px) 100vw, 42vw" className="object-cover" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/25 via-transparent to-transparent" />
        </div>
        <div>
          <p className="text-sm tracking-[0.16em] text-slate uppercase">Made for the workday</p>
          <h2 className="mt-3 max-w-xl text-3xl text-ink md:text-4xl">A simpler way to keep your workplace moving.</h2>
          <p className="mt-4 max-w-xl text-slate">Choose a published-price item for quick checkout, or build a quote list when your team needs volume, options or a tailored delivery plan.</p>
          <div className="mt-8 grid gap-5 sm:grid-cols-3 lg:grid-cols-1">
            <div><p className="font-medium text-ink">One catalogue</p><p className="mt-1 text-sm text-slate">Paper, stationery, toner and everyday essentials in one place.</p></div>
            <div><p className="font-medium text-ink">Two clear paths</p><p className="mt-1 text-sm text-slate">Cart for retail. Quote for procurement. Always kept separate.</p></div>
            <div><p className="font-medium text-ink">Human support</p><p className="mt-1 text-sm text-slate">Our team helps with bulk requirements and nationwide delivery.</p></div>
          </div>
        </div>
      </section>

      <section className="paper-section-wash border-y border-border bg-muted/30 py-14 sm:py-16" aria-labelledby="how-it-works">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl"><p className="text-xs font-semibold tracking-[0.18em] text-paper-green uppercase">Simple by design</p><h2 id="how-it-works" className="paper-section-title mt-3 text-3xl tracking-tight text-ink sm:text-4xl">From “we need supplies” to sorted.</h2><p className="mt-3 text-slate">Choose the route that fits your workday. We keep the next step clear.</p></div>
          <div className="mt-8 grid gap-3 md:grid-cols-3 md:gap-4">
            {[
              { icon: Search, step: "01", title: "Find what you need", body: "Browse the catalogue by category, brand or search." },
              { icon: ClipboardList, step: "02", title: "Choose your route", body: "Use Cart for quick checkout or Quote for volume planning." },
              { icon: PackageCheck, step: "03", title: "We make it happen", body: "Get clear updates, dependable fulfilment and delivery support." },
            ].map(({ icon: Icon, step, title, body }) => (
              <div key={step} className="paper-hover-lift rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
                <div className="flex items-center justify-between gap-4"><span className="grid size-10 place-items-center rounded-xl bg-paper-green/10 text-paper-green"><Icon className="size-5" aria-hidden /></span><span className="text-xs font-semibold tracking-[0.16em] text-slate">{step}</span></div>
                <h3 className="mt-5 font-semibold text-ink">{title}</h3><p className="mt-2 text-sm leading-6 text-slate">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="paper-section-wash border-t border-border/70 bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-end justify-between gap-4">
            <div><p className="text-xs font-semibold tracking-[0.18em] text-paper-green uppercase">A considered shortlist</p><h2 className="paper-section-title mt-2 text-3xl tracking-tight text-ink sm:text-4xl">Featured workplace essentials</h2></div>
            <Link href="/shop" className="hidden shrink-0 items-center gap-1 rounded-full border border-border px-4 py-2 text-sm font-semibold text-ink transition hover:border-paper-green hover:text-paper-green sm:inline-flex">View catalogue <ArrowRight className="size-4" aria-hidden /></Link>
          </div>
          <p className="mt-3 max-w-2xl text-slate">
            Unit prices, bulk bands and stock from the PaperSource catalogue.
            Add to Cart and Add to Quote stay independent.
          </p>
          <div className="mt-8">
            <ProductGridList products={featured} canEdit={canEdit} />
          </div>
          <Link href="/shop" className="mt-6 inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-sm font-semibold text-ink transition hover:border-paper-green hover:text-paper-green sm:hidden">View full catalogue <ArrowRight className="size-4" aria-hidden /></Link>
        </div>
      </section>

      <Testimonials />

      <section className="paper-section-wash border-t border-border/70 bg-card py-14 sm:py-16" aria-labelledby="buying-guides">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <div><p className="text-xs font-semibold tracking-[0.18em] text-paper-green uppercase">Useful guidance</p><h2 id="buying-guides" className="paper-section-title mt-2 text-3xl tracking-tight text-ink sm:text-4xl">Make a more confident choice</h2></div>
            <Link href="/guides" className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-ink underline underline-offset-4 transition hover:text-paper-green sm:inline-flex">All guides <ArrowRight className="size-4" aria-hidden /></Link>
          </div>
          <p className="mt-3 max-w-2xl text-slate">Practical advice for offices, schools and organisations buying stationery and workplace supplies in Ghana.</p>
          <div className="mt-7 grid gap-4 md:grid-cols-3">{SEO_GUIDES.slice(0, 3).map((guide) => <article key={guide.slug} className="paper-hover-lift rounded-2xl border border-border bg-background p-5 shadow-sm"><h3 className="font-heading text-xl text-ink"><Link href={`/guides/${guide.slug}`} className="underline-offset-4 hover:underline">{guide.title}</Link></h3><p className="mt-2 text-sm leading-6 text-slate">{guide.description}</p><Link href={`/guides/${guide.slug}`} className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-ink underline underline-offset-4">Read guide</Link></article>)}</div>
          <Link href="/guides" className="mt-6 inline-flex min-h-11 items-center text-sm font-semibold text-ink underline underline-offset-4 sm:hidden">Browse all buying guides →</Link>
        </div>
      </section>

      <SocialActivitySection />

      <CorporateBanner
        title="Procurement without the paperwork headache."
        body="Request bulk prices, upload your procurement list and receive a customised quotation from PaperSource."
      />
    </main>
  );
}
