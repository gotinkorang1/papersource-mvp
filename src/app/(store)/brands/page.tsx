import type { Metadata } from "next";
import { listBrandDirectory } from "@/features/catalogue";
import { BrandDirectory } from "@/components/products/brand-directory";
import { collectionPageJsonLd, pageMetadata, absoluteUrl } from "@/lib/seo";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { breadcrumbJsonLd } from "@/features/catalogue";

export const metadata: Metadata = pageMetadata({
  title: "Office stationery brands in Ghana",
  description: "Browse trusted paper, printer, writing and workplace supply brands available through PaperSource Ghana.",
  path: "/brands",
});

export default async function BrandsPage() {
  const brands = await listBrandDirectory();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-16 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageJsonLd({ name: "Office stationery brands in Ghana", description: "Browse trusted paper, printer, writing and workplace supply brands available through PaperSource Ghana.", url: absoluteUrl("/brands"), items: brands.map((brand, index) => ({ name: brand.name, url: absoluteUrl(`/brands/${brand.slug}`), position: index + 1 })) })) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([{ name: "Brands", href: "/brands" }], absoluteUrl("/").replace(/\/$/, ""))) }} />
      <Breadcrumbs items={[{ label: "Brands" }]} />
      <h1 className="mt-5 font-heading text-4xl font-semibold tracking-tight text-ink md:text-6xl">Brands you can specify with confidence.</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-slate">
        Workplace supplies from brands Ghanaian offices already specify.
      </p>
      <BrandDirectory brands={brands} />
    </main>
  );
}
