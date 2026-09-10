import Link from "next/link";
import Image from "next/image";
import { paperButton } from "@/components/commerce/paper-button";
import { CorporateBanner } from "@/components/marketing/corporate-banner";
import { CategoryTile } from "@/components/products/category-tile";
import { ProductGridList } from "@/components/products/product-grid-list";
import { Testimonials } from "@/components/marketing/testimonials";
import { LiveDeliveryStatus } from "@/components/marketing/live-delivery-status";
import { WorkdayCarousel } from "@/components/marketing/workday-carousel";
import {
  listDivisionCategories,
  listFeaturedProductCards,
} from "@/features/catalogue";
import { canAccessAdmin } from "@/lib/staff/rbac";
import { readStaffActor } from "@/lib/staff/require";
import { cloudinaryImageUrl } from "@/lib/cloudinary";

export default async function HomePage() {
  const categories = await listDivisionCategories();
  const featured = await listFeaturedProductCards();
  const staff = await readStaffActor();
  const canEdit = staff ? canAccessAdmin(staff.role, "products", "write") : false;
  const categoryImages: Record<string, { src: string; alt: string }> = {
    paper: { src: "/images/close-up-view-back-school-concept.jpg", alt: "Paper, notebooks and colourful stationery" },
    writing: { src: "/images/extreme-close-up-pen-taken-by-person-from-desk-organizer.jpg", alt: "Pens arranged in a desk organiser" },
    filing: { src: "/images/ring-binder-used-stored-documents.jpg", alt: "Ring binder holding organised documents" },
    "desk-essentials": { src: "/images/lightbox-still-life-arrangement.jpg", alt: "Everyday desk essentials arranged neatly" },
    printing: { src: "/images/home-printer-based-toner.jpg", alt: "Home printer and printing supplies" },
    technology: { src: "/images/female-graphic-designer-writing-diary.jpg", alt: "Creative professional working with office technology" },
    "school-supplies": { src: "/images/school-stationery-with-accessories.jpg", alt: "School stationery and learning accessories" },
    workplace: { src: "/images/still-life-documents-stack.jpg", alt: "Workplace documents and office supplies" },
  };
  const categoryImageFor = (category: (typeof categories)[number]) => {
    const uploaded = category.imagePublicId ? cloudinaryImageUrl(category.imagePublicId, 800) : null;
    if (uploaded) return { src: uploaded, alt: `${category.name} workplace supplies` };
    const key = `${category.slug} ${category.name}`.toLocaleLowerCase();
    const match = Object.entries(categoryImages).find(([alias]) => key.includes(alias));
    return match?.[1] ?? { src: "/images/catalogue-stationery-generated.png", alt: `${category.name} workplace supplies` };
  };

  return (
    <main className="overflow-hidden">
      <section className="paper-grain relative isolate mx-auto max-w-7xl overflow-hidden rounded-b-[2rem] border-x border-b border-border/70 px-4 py-12 shadow-[0_18px_55px_rgba(16,42,67,0.06)] sm:px-6 sm:py-16 md:px-8 md:py-24">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 -z-10 size-72 rounded-full bg-ochre/10 blur-3xl" />
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <div>
        <p className="inline-flex rounded-full border border-paper-green/25 bg-paper-green/10 px-3 py-1 text-xs font-semibold tracking-[0.14em] text-paper-green uppercase">
          Ghana&apos;s modern workplace supply partner
        </p>
        <h1 className="mt-5 max-w-3xl text-balance text-4xl leading-[1.05] tracking-tight text-ink motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 sm:text-5xl md:text-7xl">
          Everything your workplace needs.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate md:text-xl">
          Office stationery, paper, printing supplies and workplace essentials —
          delivered across Accra &amp; Tema.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link href="/shop" className={`${paperButton()} w-full sm:w-auto`}>
            Shop Products
          </Link>
          <Link
            href="/request-quote"
            className={`${paperButton({ variant: "quote" })} w-full sm:w-auto`}
          >
            Request Bulk Quote
          </Link>
        </div>
        <p className="mt-6 text-sm text-slate">
          Nationwide supply available on request.
        </p>
        <LiveDeliveryStatus />
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-cream shadow-[0_24px_60px_rgba(16,42,67,0.16)]">
            <Image src="/images/catalogue-stationery-generated.png" alt="Stationery, notebooks, paper and desk supplies arranged for a productive workday" fill priority loading="eager" fetchPriority="high" sizes="(max-width: 1024px) 100vw, 46vw" className="object-cover transition-transform duration-700 motion-safe:hover:scale-105" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-tr from-ink/20 via-transparent to-transparent" />
          </div>
        </div>
      </section>

      <WorkdayCarousel />

      <section className="border-y border-border/80 bg-card py-14 sm:py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xs font-semibold tracking-[0.18em] text-paper-green uppercase">Shop the workplace</h2>
              <p className="mt-2 max-w-xl text-sm text-slate sm:text-base">Start with a category and find the supplies your team uses every day.</p>
            </div>
            <Link href="/shop" className="hidden shrink-0 text-sm font-semibold text-ink underline underline-offset-4 sm:inline-flex">Browse all</Link>
          </div>
          <div className="mt-7 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {categories.map((category) => (
              <CategoryTile
                key={category.slug}
                name={category.name}
                href={`/shop/${category.slug}`}
                caption={category.caption}
                imageSrc={categoryImageFor(category).src}
                imageAlt={categoryImageFor(category).alt}
              />
            ))}
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

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-sm tracking-[0.16em] text-slate uppercase">From the catalogue</h2>
            <Link href="/shop" className="hidden text-sm font-semibold text-ink underline underline-offset-4 sm:inline-flex">View catalogue</Link>
          </div>
          <p className="mt-2 max-w-2xl text-slate">
            Unit prices, bulk bands and stock from the PaperSource catalogue.
            Add to Cart and Add to Quote stay independent.
          </p>
          <div className="mt-8">
            <ProductGridList products={featured} canEdit={canEdit} />
          </div>
          <Link href="/shop" className="mt-6 inline-flex text-sm font-semibold text-ink underline underline-offset-4 sm:hidden">View full catalogue →</Link>
        </div>
      </section>

      <Testimonials />

      <CorporateBanner
        title="Procurement without the paperwork headache."
        body="Request bulk prices, upload your procurement list and receive a customised quotation from PaperSource."
      />
    </main>
  );
}
