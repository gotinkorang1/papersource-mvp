import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGridList } from "@/components/products/product-grid-list";
import { CataloguePagination } from "@/components/products/catalogue-pagination";
import { getBrandBySlug, listBrandDirectory, listProductCards } from "@/features/catalogue";
import { collectionItemPosition, collectionPageJsonLd, pageMetadata, absoluteUrl } from "@/lib/seo";
import { canAccessAdmin } from "@/lib/staff/rbac";
import { readStaffActor } from "@/lib/staff/require";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { breadcrumbJsonLd } from "@/features/catalogue";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { page } = await searchParams;
  const brand = await getBrandBySlug(slug);

  if (!brand) {
    return { title: "Brand" };
  }

  return {
    ...pageMetadata({
    title: `${brand.name} supplies in Ghana`,
    description: `${brand.name} workplace supplies from PaperSource. Accra and Tema delivery.`,
    path: `/brands/${brand.slug}`,
    }),
    ...(page && Number.parseInt(page, 10) > 1 ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function BrandPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const brand = await getBrandBySlug(slug);

  if (!brand) {
    notFound();
  }

  const [products, directory] = await Promise.all([listProductCards({ brandSlug: slug }), listBrandDirectory()]);
  const brandDirectoryEntry = directory.find((entry) => entry.slug === brand.slug);
  const coveredCategories = brandDirectoryEntry?.categories.map((category) => category.name) ?? [];
  const pageSize = 24;
  const totalPages = Math.max(1, Math.ceil(products.length / pageSize));
  const page = Math.min(Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1), totalPages);
  const visibleProducts = products.slice((page - 1) * pageSize, page * pageSize);
  const staff = await readStaffActor();
  const canEdit = staff ? canAccessAdmin(staff.role, "brands", "write") : false;

  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageJsonLd({ name: `${brand.name} supplies in Ghana`, description: `${brand.name} workplace supplies from PaperSource Ghana.`, url: absoluteUrl(`/brands/${brand.slug}`), totalItems: products.length, items: visibleProducts.map((product, index) => ({ name: product.name, url: absoluteUrl(`/product/${product.slug}`), position: collectionItemPosition(page, pageSize, index) })) })) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([{ name: "Brands", href: "/brands" }, { name: brand.name, href: `/brands/${brand.slug}` }], absoluteUrl("/").replace(/\/$/, ""))) }} />
      <Breadcrumbs items={[{ label: "Brands", href: "/brands" }, { label: brand.name }]} />
      <div className="flex flex-wrap items-start gap-3"><h1 className="text-3xl text-ink">{brand.name}</h1>{canEdit ? <Link href={`/admin/brands#brand-${brand.id}`} className="inline-flex min-h-9 items-center rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Edit brand</Link> : null}</div>
      <p className="mt-3 max-w-2xl text-slate">
        Explore {brand.name} products in the PaperSource catalogue, including {coveredCategories.length ? coveredCategories.join(", ") : "workplace essentials"}. {products.length} active {products.length === 1 ? "product is" : "products are"} currently available for Accra and Tema delivery.
      </p>
      <div className="mt-10">
        <ProductGridList products={visibleProducts} canEdit={canEdit} />
        <CataloguePagination basePath={`/brands/${brand.slug}`} page={page} totalPages={totalPages} totalItems={products.length} query={{}} />
      </div>
    </main>
  );
}
