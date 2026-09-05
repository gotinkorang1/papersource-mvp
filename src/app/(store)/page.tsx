import Link from "next/link";
import Image from "next/image";
import { paperButton } from "@/components/commerce/paper-button";
import { CorporateBanner } from "@/components/marketing/corporate-banner";
import { CategoryTile } from "@/components/products/category-tile";
import { ProductGridList } from "@/components/products/product-grid-list";
import { Testimonials } from "@/components/marketing/testimonials";
import { LiveDeliveryStatus } from "@/components/marketing/live-delivery-status";
import {
  listDivisionCategories,
  listFeaturedProductCards,
} from "@/features/catalogue";

export default async function HomePage() {
  const categories = await listDivisionCategories();
  const featured = await listFeaturedProductCards();

  return (
    <main>
      <section className="paper-grain relative isolate mx-auto max-w-6xl overflow-hidden rounded-b-2xl px-4 py-16 md:py-24">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 -z-10 size-72 rounded-full bg-ochre/10 blur-3xl" />
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
        <p className="text-sm tracking-[0.16em] text-slate uppercase">
          Ghana&apos;s modern workplace supply partner
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl leading-tight tracking-tight text-ink motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 md:text-6xl">
          Everything your workplace needs.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-slate">
          Office stationery, paper, printing supplies and workplace essentials —
          delivered across Accra &amp; Tema.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/shop" className={paperButton()}>
            Shop Products
          </Link>
          <Link
            href="/request-quote"
            className={paperButton({ variant: "quote" })}
          >
            Request Bulk Quote
          </Link>
        </div>
        <p className="mt-6 text-sm text-slate">
          Nationwide supply available on request.
        </p>
        <LiveDeliveryStatus />
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-cream shadow-[0_20px_50px_rgba(16,42,67,0.12)]">
            <Image src="/images/top-view-colorful-pencils-wih-copy-space.jpg" alt="Colourful pencils arranged on a desk" fill priority sizes="(max-width: 1024px) 100vw, 46vw" className="object-cover transition-transform duration-700 motion-safe:hover:scale-105" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-tr from-ink/20 via-transparent to-transparent" />
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-sm tracking-[0.16em] text-slate uppercase">
            Shop the workplace
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {categories.map((category) => (
              <CategoryTile
                key={category.slug}
                name={category.name}
                href={`/shop/${category.slug}`}
                caption={category.caption}
                imageSrc={category.slug === "stationery" ? "/images/set-school-stationery.jpg" : category.slug === "books" ? "/images/stack-books-with-library-scene.jpg" : "/images/home-printer-based-toner.jpg"}
                imageAlt={`${category.name} supplies`}
              />
            ))}
          </div>
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
          <h2 className="text-sm tracking-[0.16em] text-slate uppercase">
            From the catalogue
          </h2>
          <p className="mt-2 max-w-2xl text-slate">
            Unit prices, bulk bands and stock from the PaperSource catalogue.
            Add to Cart and Add to Quote stay independent.
          </p>
          <div className="mt-8">
            <ProductGridList products={featured} />
          </div>
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
