import Link from "next/link";
import { paperButton } from "@/components/commerce/paper-button";
import { CorporateBanner } from "@/components/marketing/corporate-banner";
import { CategoryTile } from "@/components/products/category-tile";
import { ProductGridList } from "@/components/products/product-grid-list";
import {
  listDivisionCategories,
  listFeaturedProductCards,
} from "@/features/catalogue";

export default function HomePage() {
  const categories = listDivisionCategories();
  const featured = listFeaturedProductCards();

  return (
    <main>
      <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <p className="text-sm tracking-[0.16em] text-slate uppercase">
          Ghana&apos;s modern workplace supply partner
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl leading-tight tracking-tight text-ink md:text-6xl">
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
      </section>

      <section className="border-y border-border bg-card py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-sm tracking-[0.16em] text-slate uppercase">
            Shop the workplace
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-px bg-border md:grid-cols-4">
            {categories.map((category) => (
              <CategoryTile key={category.name} {...category} />
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
