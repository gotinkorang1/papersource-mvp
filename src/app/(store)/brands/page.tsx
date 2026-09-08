import type { Metadata } from "next";
import Link from "next/link";
import { listBrands } from "@/features/catalogue";
import { BrandLogo } from "@/components/marketing/brand-logo";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";

export const metadata: Metadata = pageMetadata({
  title: "Office stationery brands in Ghana",
  description: "Browse trusted paper, printer, writing and workplace supply brands available through PaperSource Ghana.",
  path: "/brands",
});

export default async function BrandsPage() {
  const brands = await listBrands();

  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <Breadcrumbs items={[{ label: "Brands" }]} />
      <h1 className="text-3xl text-ink">Brands</h1>
      <p className="mt-3 max-w-2xl text-slate">
        Workplace supplies from brands Ghanaian offices already specify.
      </p>
      <ul className="mt-10 grid gap-px bg-border sm:grid-cols-2 md:grid-cols-3">
        {brands.map((brand) => (
          <li key={brand.id} className="bg-card">
            <Link
              href={`/brands/${brand.slug}`}
              className="flex min-h-28 items-center gap-4 px-5 py-6 hover:bg-cream"
            >
              <BrandLogo name={brand.name} />
              <span className="text-ink">{brand.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
