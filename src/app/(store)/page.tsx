import Link from "next/link";
import Image from "next/image";
import { paperButton } from "@/components/commerce/paper-button";
import { CorporateBanner } from "@/components/marketing/corporate-banner";
import { CategoryTile } from "@/components/products/category-tile";
import { ProductGridList } from "@/components/products/product-grid-list";
import {
  listDivisionCategories,
  listFeaturedProductCards,
} from "@/features/catalogue";

export default async function HomePage() {
  const categories = await listDivisionCategories();
  const featured = await listFeaturedProductCards();

  return (
    <main>
      <section className="relative isolate mx-auto max-w-6xl overflow-hidden px-4 py-16 md:py-24">
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
          <div className="mt-8 grid grid-cols-2 gap-px bg-border md:grid-cols-4">
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

      <CorporateBanner
        title="Procurement without the paperwork headache."
        body="Request bulk prices, upload your procurement list and receive a customised quotation from PaperSource."
      />
    </main>
  );
}
