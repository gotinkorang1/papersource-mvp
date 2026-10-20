import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Layers, MessageCircle, Store, Truck } from "lucide-react";
import { BulkPriceTable } from "@/components/commerce/bulk-price-table";
import { DeliveryBadge } from "@/components/commerce/delivery-badge";
import { PriceDisplay } from "@/components/commerce/price-display";
import { StockBadge } from "@/components/commerce/stock-badge";
import { OfficeBundleCard } from "@/components/products/office-bundle-card";
import { ProductGallery } from "@/components/products/product-gallery";
import { ProductPurchase } from "@/components/products/product-purchase";
import { breadcrumbJsonLd, findDeliveredOrderForReview, getProductBySlug, listApprovedProductReviews, listProductCards, productJsonLd } from "@/features/catalogue";
import { absoluteUrl, notFoundPageMetadata, pageMetadata, productSeoTitle, SITE_URL } from "@/lib/seo";
import { ProductEngagement } from "@/components/products/product-engagement";
import { CopySkuButton } from "@/components/products/copy-sku-button";
import { canAccessAdmin } from "@/lib/staff/rbac";
import { readStaffActor } from "@/lib/staff/require";
import { ProductGridList } from "@/components/products/product-grid-list";
import { visibleBulkTiers } from "@/features/catalogue/pricing";
import { bookMetadata, productSeoDescription, productSeoKeywords } from "@/features/catalogue/product-metadata";
import { listSavedLists } from "@/features/saved-lists/repository";
import { readCustomerActor } from "@/lib/customer/require";
import { ProductViewTracker } from "@/components/products/product-view-tracker";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { RecentlyViewed } from "@/components/products/recently-viewed";
import { getStoreSettings } from "@/features/settings/admin";
import { productEnquiryMessage, whatsappChatLink } from "@/lib/whatsapp";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return notFoundPageMetadata("Product not found");
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
    keywords: productSeoKeywords({ name: product.name, brandName: product.brandName, categoryName: product.categoryName, description: seoDescription, specLine: product.specLine }),
  });
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const origin = SITE_URL;
  const [staff, customer, settings] = await Promise.all([
    readStaffActor(),
    readCustomerActor(),
    getStoreSettings().catch(() => null),
  ]);
  const canEdit = staff ? canAccessAdmin(staff.role, "products", "write") : false;
  const enquiryLink = whatsappChatLink(
    settings?.whatsappBusinessNumber,
    productEnquiryMessage({ name: product.name, sku: product.sku, url: absoluteUrl(`/product/${product.slug}`) }),
  );
  // Saved lists are an optional account enhancement. A missing/unapplied
  // migration or transient database error must never take down a product page.
  const savedLists = customer
    ? await listSavedLists(customer).catch(() => [])
    : [];
  const [reviews, relatedProducts, reviewOrderId] = await Promise.all([
    listApprovedProductReviews(product.id),
    listProductCards({ categorySlug: product.categorySlug, excludeProductId: product.id, maxResults: 5 }),
    customer ? findDeliveredOrderForReview(customer.profileId, product.id) : Promise.resolve(null),
  ]);
  const related = relatedProducts.slice(0, 4);
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
    <main className="paper-product-page mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-16 lg:px-8">
      <ProductViewTracker productId={product.id} sku={product.sku} productName={product.name} pricePesewas={product.unitPricePesewas} enabled={!canEdit} />
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
      <Breadcrumbs items={crumbs.map((crumb, index) => ({ label: crumb.name, href: index === crumbs.length - 1 ? undefined : crumb.href }))} />

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12">
        <div className="paper-product-gallery lg:sticky lg:top-24 lg:self-start"><ProductGallery key={product.slug} alt={product.imageAlt.trim() || [product.name, product.specLine].filter(Boolean).join(", ")} src={product.imageSrc} images={product.imageSources} /></div>
        <div className="paper-product-detail-panel rounded-2xl border border-border bg-card p-5 shadow-[0_18px_50px_rgba(43,50,49,0.08)] sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-paper-green">
            <Link href={`/brands/${product.brandSlug}`} className="hover:text-ink">
              {product.brandName}
            </Link>
          </p>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h1 className="mt-2 font-heading text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">{product.name}</h1>
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
            <a href={enquiryLink} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#128c7e]/40 bg-[#128c7e]/5 px-4 py-2.5 text-sm font-semibold text-[#0b6b5f] transition hover:bg-[#128c7e]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink dark:text-[#5fd3c4]">
              <MessageCircle className="size-4" aria-hidden /> Ask about this product on WhatsApp
              <span className="sr-only">(opens WhatsApp)</span>
            </a>
          </div>
          <ul aria-label="Why buy from PaperSource" className="mt-8 grid gap-x-5 gap-y-4 rounded-xl border border-border bg-muted/30 p-4 sm:grid-cols-2 sm:p-5">
            {[
              { icon: Truck, title: "Accra & Tema delivery", body: "Clear delivery pricing at checkout." },
              ...(product.deliveryBadge.pickupAvailable ? [{ icon: Store, title: "Shop pickup available", body: "Collect from our shop with no delivery fee." }] : []),
              { icon: Layers, title: "Bulk-ready pricing", body: "Request a quote for larger quantities." },
              { icon: MessageCircle, title: "Help when you need it", body: "WhatsApp support from our team." },
            ].map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex items-start gap-3">
                <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-surface text-paper-green"><Icon className="size-4" strokeWidth={1.75} /></span>
                <span className="min-w-0 text-sm leading-5">
                  <span className="block font-semibold text-ink">{title}</span>
                  <span className="mt-0.5 block text-slate">{body}</span>
                </span>
              </li>
            ))}
          </ul>
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
      <RecentlyViewed className="mt-14 border-t border-border pt-8" record={{ slug: product.slug, name: product.name, specLine: product.specLine || undefined, imageSrc: product.imageSrc, imageAlt: product.imageAlt || undefined }} />
      <ProductEngagement productId={product.id} productName={product.name} reviews={reviews} canReview={Boolean(reviewOrderId)} nextPath={`/product/${product.slug}`} />
    </main>
  );
}
