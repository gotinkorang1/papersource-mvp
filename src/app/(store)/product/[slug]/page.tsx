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
import { breadcrumbJsonLd, getProductBySlug, listApprovedProductReviews, listProductCards, productJsonLd } from "@/features/catalogue";
import { absoluteUrl, pageMetadata, productSeoTitle, SITE_URL } from "@/lib/seo";
import { ProductEngagement } from "@/components/products/product-engagement";
import { CopySkuButton } from "@/components/products/copy-sku-button";
import { canAccessAdmin } from "@/lib/staff/rbac";
import { readStaffActor } from "@/lib/staff/require";
import { ProductGridList } from "@/components/products/product-grid-list";
import { visibleBulkTiers } from "@/features/catalogue/pricing";
import { bookMetadata, productSeoDescription } from "@/features/catalogue/product-metadata";
import { listSavedLists } from "@/features/saved-lists/repository";
import { readCustomerActor } from "@/lib/customer/require";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Product" };
  }

  const seoTitle = product.attributes.find(
    (attribute) => attribute.key === "seo_title",
  )?.valueText.trim();
  const seoDescription = productSeoDescription(product);

  return pageMetadata({
    title: seoTitle || productSeoTitle(product.name, product.specLine),
    description: seoDescription,
    path: `/product/${product.slug}`,
    image: product.imageSrc,
    modifiedTime: product.updatedAt,
  });
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const origin = SITE_URL;
  const staff = await readStaffActor();
  const canEdit = staff ? canAccessAdmin(staff.role, "products", "write") : false;
  const customer = await readCustomerActor();
  const savedLists = customer ? await listSavedLists(customer) : [];
  const [reviews, relatedProducts] = await Promise.all([
    listApprovedProductReviews(product.id),
    listProductCards({ categorySlug: product.categorySlug }),
  ]);
  const related = relatedProducts.filter((entry) => entry.id !== product.id).slice(0, 4);
  const bulkTiers = visibleBulkTiers(product.tiers, product.unitPricePesewas);
  const supplementalMetadata = bookMetadata(product);
  const productDescription = productSeoDescription(product);
  const canonical = absoluteUrl(`/product/${product.slug}`);
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
          __html: JSON.stringify(productJsonLd(product, canonical, reviews)),
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

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12">
        <div className="lg:sticky lg:top-24 lg:self-start"><ProductGallery key={product.slug} alt={product.imageAlt} src={product.imageSrc} images={product.imageSources} /></div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-7">
          <p className="text-sm text-slate">
            <Link href={`/brands/${product.brandSlug}`} className="hover:text-ink">
              {product.brandName}
            </Link>
          </p>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h1 className="mt-2 text-3xl leading-tight text-ink sm:text-4xl">{product.name}</h1>
            {canEdit ? <Link href={`/admin/products/${product.id}`} className="mt-2 inline-flex min-h-9 items-center rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Edit product</Link> : null}
          </div>
          {product.specLine ? <p className="mt-2 text-slate">{product.specLine}</p> : null}
          {supplementalMetadata.length ? <p className="mt-2 text-sm text-slate">{supplementalMetadata.join(" · ")}</p> : null}
          <div className="mt-4"><CopySkuButton sku={product.sku} /></div>
          <div className="mt-6 space-y-3">
            <PriceDisplay
              pesewas={product.unitPricePesewas}
              unitLabel={product.unitLabel}
            />
            {bulkTiers.length > 0 ? (
              <BulkPriceTable tiers={bulkTiers} unitLabel={product.unitLabel} />
            ) : null}
            <StockBadge level={product.stock} />
            <DeliveryBadge zone={product.deliveryBadge} />
          </div>
          <div className="mt-8">
            <ProductPurchase product={product} savedLists={savedLists.map((list) => ({ id: list.id, name: list.name }))} />
          </div>
          <div className="mt-8 grid gap-2 border-t border-border pt-6 text-xs text-slate sm:grid-cols-3">
            <div><p className="font-semibold text-ink">Accra & Tema delivery</p><p className="mt-1">Clear delivery pricing at checkout.</p></div>
            <div><p className="font-semibold text-ink">Bulk-ready pricing</p><p className="mt-1">Request a quote for larger quantities.</p></div>
            <div><p className="font-semibold text-ink">Help when you need it</p><p className="mt-1">WhatsApp support from our team.</p></div>
          </div>
          <p className="mt-6 max-w-prose text-sm text-slate">
            {productDescription}
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
      {related.length ? <section className="mt-16 border-t border-border pt-10" aria-labelledby="related-products-heading">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-medium uppercase tracking-[0.16em] text-slate">Keep exploring</p><h2 id="related-products-heading" className="mt-2 text-2xl text-ink">More from {product.categoryName}</h2></div><Link href={`/shop/${product.divisionSlug}`} className="text-sm font-semibold text-ink underline underline-offset-4">View all</Link></div>
        <div className="mt-6"><ProductGridList products={related} canEdit={canEdit} /></div>
      </section> : null}
      <ProductEngagement productId={product.id} productName={product.name} reviews={reviews} nextPath={`/product/${product.slug}`} />
    </main>
  );
}
