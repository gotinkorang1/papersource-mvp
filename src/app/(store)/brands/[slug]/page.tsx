import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGridList } from "@/components/products/product-grid-list";
import { getBrandBySlug, listProductCards } from "@/features/catalogue";
import { pageMetadata } from "@/lib/seo";
import { canAccessAdmin } from "@/lib/staff/rbac";
import { readStaffActor } from "@/lib/staff/require";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);

  if (!brand) {
    return { title: "Brand" };
  }

  return pageMetadata({
    title: `${brand.name} supplies in Ghana`,
    description: `${brand.name} workplace supplies from PaperSource. Accra and Tema delivery.`,
    path: `/brands/${brand.slug}`,
  });
}

export default async function BrandPage({ params }: PageProps) {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);

  if (!brand) {
    notFound();
  }

  const products = await listProductCards({ brandSlug: slug });
  const staff = await readStaffActor();
  const canEdit = staff ? canAccessAdmin(staff.role, "brands", "write") : false;

  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <div className="flex flex-wrap items-start gap-3"><h1 className="text-3xl text-ink">{brand.name}</h1>{canEdit ? <Link href={`/admin/brands#brand-${brand.id}`} className="inline-flex min-h-9 items-center rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Edit brand</Link> : null}</div>
      <p className="mt-3 max-w-2xl text-slate">
        {brand.name} products in the PaperSource catalogue.
      </p>
      <div className="mt-10">
        <ProductGridList products={products} canEdit={canEdit} />
      </div>
    </main>
  );
}
