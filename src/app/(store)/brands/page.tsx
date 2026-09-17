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
    <main className="mx-auto max-w-6xl px-4 py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageJsonLd({ name: "Office stationery brands in Ghana", description: "Browse trusted paper, printer, writing and workplace supply brands available through PaperSource Ghana.", url: absoluteUrl("/brands"), items: brands.map((brand, index) => ({ name: brand.name, url: absoluteUrl(`/brands/${brand.slug}`), position: index + 1 })) })) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([{ name: "Brands", href: "/brands" }], absoluteUrl("/").replace(/\/$/, ""))) }} />
      <Breadcrumbs items={[{ label: "Brands" }]} />
      <h1 className="text-3xl text-ink">Brands</h1>
      <p className="mt-3 max-w-2xl text-slate">
        Workplace supplies from brands Ghanaian offices already specify.
      </p>
      <BrandDirectory brands={brands} />
    </main>
  );
}
