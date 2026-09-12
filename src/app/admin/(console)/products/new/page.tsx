import type { Metadata } from "next";
import Link from "next/link";
import { AdminError } from "@/components/admin/field";
import { NewProductForm } from "@/components/admin/new-product-form";
import { listTaxonomyOptions } from "@/features/catalogue/admin";
import { requireStaffArea } from "@/lib/staff/require";

export const metadata: Metadata = {
  title: "New product",
};

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminNewProductPage({ searchParams }: PageProps) {
  await requireStaffArea("products", "write");
  const { brands, categories } = await listTaxonomyOptions();
  const { error } = await searchParams;

  return (
    <main>
      <p className="text-sm tracking-[0.16em] text-slate uppercase">
        <Link href="/admin/products" className="underline">
          Products
        </Link>
      </p>
      <h1 className="mt-2 font-heading text-3xl text-ink">New product</h1>
      <p className="mt-3 max-w-2xl text-slate">
        Creates a draft SKU. Set it active when it should appear on the shop.
      </p>
      <AdminError error={error} />
      <NewProductForm brands={brands} categories={categories} />
    </main>
  );
}
