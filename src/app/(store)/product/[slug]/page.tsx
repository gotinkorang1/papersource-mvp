import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BulkPriceTable } from "@/components/commerce/bulk-price-table";
import { DeliveryBadge } from "@/components/commerce/delivery-badge";
import { PriceDisplay } from "@/components/commerce/price-display";
import { StockBadge } from "@/components/commerce/stock-badge";
import { OfficeBundleCard } from "@/components/products/office-bundle-card";
import { ProductGallery } from "@/components/products/product-gallery";
import { ProductPurchase } from "@/components/products/product-purchase";
import { breadcrumbJsonLd, getProductBySlug, productJsonLd } from "@/features/catalogue";
import { publicEnv } from "@/lib/env";
import { pageMetadata } from "@/lib/seo";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function siteOrigin() {
  return publicEnv.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Product" };
  }

  return pageMetadata({
    title: `${product.name} · ${product.specLine}`,
    description: product.description,
    path: `/product/${product.slug}`,
    image: product.imageSrc,
  });
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const origin = siteOrigin();
  const canonical = `${origin}/product/${product.slug}`;
  const crumbs = [
    { name: "Shop", href: "/shop" },
    { name: product.divisionName, href: `/shop/${product.divisionSlug}` },
    { name: product.name, href: `/product/${product.slug}` },
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd(product, canonical)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd(crumbs, origin)),
        }}
      />
      <nav aria-label="Breadcrumb" className="text-sm text-slate">
        <ol className="flex flex-wrap gap-1">
          {crumbs.map((crumb, index) => (
            <li key={crumb.href} className="flex gap-1">
              {index > 0 ? <span aria-hidden>/</span> : null}
              {index === crumbs.length - 1 ? (
                <span className="text-ink">{crumb.name}</span>
              ) : (
                <Link href={crumb.href} className="hover:text-ink">
                  {crumb.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-8 grid gap-10 md:grid-cols-2">
        <ProductGallery alt={product.imageAlt} src={product.imageSrc} />
        <div>
          <p className="text-sm text-slate">
            <Link href={`/brands/${product.brandSlug}`} className="hover:text-ink">
              {product.brandName}
            </Link>
          </p>
          <h1 className="mt-2 text-3xl text-ink">{product.name}</h1>
          <p className="mt-2 text-slate">{product.specLine}</p>
          <p className="mt-4 font-mono text-sm text-slate">SKU {product.sku}</p>
          <div className="mt-6 space-y-3">
            <PriceDisplay
              pesewas={product.unitPricePesewas}
              unitLabel={product.unitLabel}
            />
            <BulkPriceTable
              tiers={product.tiers}
              unitLabel={product.unitLabel}
            />
            <StockBadge level={product.stock} />
            <DeliveryBadge zone={product.deliveryBadge} />
          </div>
          <div className="mt-8">
            <ProductPurchase product={product} />
          </div>
          <p className="mt-6 max-w-prose text-sm text-slate">
            {product.description}
          </p>
          {product.bundleContents ? (
            <div className="mt-8">
              <OfficeBundleCard
                name={product.name}
                contents={product.bundleContents}
              />
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
