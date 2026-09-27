import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { ProductGridList } from "@/components/products/product-grid-list";
import { CataloguePagination } from "@/components/products/catalogue-pagination";
import { getCategoryBySlug, listProductCards } from "@/features/catalogue";
import { categorySeoDescription } from "@/features/catalogue/seo-copy";
import { breadcrumbJsonLd } from "@/features/catalogue";
import { collectionItemPosition, collectionPageJsonLd, notFoundPageMetadata, pageMetadata, absoluteUrl } from "@/lib/seo";
import { categoryImageFor } from "@/features/catalogue/category-images";
import { canAccessAdmin } from "@/lib/staff/rbac";
import { readStaffActor } from "@/lib/staff/require";
import type { CatalogueViewMode } from "@/components/products/catalogue-view-mode";

type PageProps = {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string; view?: string }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { category: slug } = await params;
  const { page } = await searchParams;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return notFoundPageMetadata("Category not found");
  }
  const description = categorySeoDescription(category);

  return {
    ...pageMetadata({
    title: `${category.name} for Ghana workplaces`,
    description,
    path: `/shop/${category.slug}`,
    }),
    ...(page && Number.parseInt(page, 10) > 1 ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function ShopCategoryPage({ params, searchParams }: PageProps) {
  const { category: slug } = await params;
  const { page: pageParam, view } = await searchParams;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }
  if (category.slug !== slug) {
    permanentRedirect(`/shop/${category.slug}`);
  }
  const description = categorySeoDescription(category);

  const products = await listProductCards({ categorySlug: category.slug });
  const pageSize = 24;
  const totalPages = Math.max(1, Math.ceil(products.length / pageSize));
  const page = Math.min(Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1), totalPages);
  const visibleProducts = products.slice((page - 1) * pageSize, page * pageSize);
  const staff = await readStaffActor();
  const canEdit = staff ? canAccessAdmin(staff.role, "categories", "write") : false;
  const viewMode = ["default", "grid", "list", "content"].includes(view ?? "") ? view as CatalogueViewMode : undefined;
  const image = categoryImageFor(category);

  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageJsonLd({ name: `${category.name} for Ghana workplaces`, description: categorySeoDescription(category), url: absoluteUrl(`/shop/${category.slug}`), totalItems: products.length, items: visibleProducts.map((product, index) => ({ name: product.name, url: absoluteUrl(`/product/${product.slug}`), position: collectionItemPosition(page, pageSize, index) })) })) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([{ name: "Shop", href: "/shop" }, { name: category.name, href: `/shop/${category.slug}` }], absoluteUrl("/").replace(/\/$/, ""))) }} />
      <Breadcrumbs items={[{ label: "Shop", href: "/shop" }, { label: category.name }]} />
      <div className="mt-4 grid items-center gap-6 md:grid-cols-[1fr_16rem]">
        <div><div className="flex flex-wrap items-start gap-3"><h1 className="text-3xl text-ink md:text-4xl">{category.name}</h1>{canEdit ? <Link href={`/admin/categories#category-${category.id}`} className="inline-flex min-h-9 items-center rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Edit category</Link> : null}</div><p className="mt-3 max-w-2xl text-slate">{description} Browse {products.length} active {products.length === 1 ? "product" : "products"} for workplaces, schools and everyday stationery needs.</p></div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-cream shadow-sm"><Image src={image.src} alt={image.alt} fill priority loading="eager" fetchPriority="high" sizes="(max-width: 768px) 100vw, 16rem" className="object-cover" /></div>
      </div>
      <div className="mt-10">
        <ProductGridList products={visibleProducts} canEdit={canEdit} viewMode={viewMode} />
        <CataloguePagination basePath={`/shop/${category.slug}`} page={page} totalPages={totalPages} totalItems={products.length} query={viewMode ? { view: viewMode } : {}} />
      </div>
    </main>
  );
}
