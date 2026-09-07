import type { Metadata } from "next";
import Link from "next/link";
import { AdminError, AdminField, adminAreaClass, adminFieldClass } from "@/components/admin/field";
import { SubmitProgressButton } from "@/components/admin/submit-progress-button";
import { paperButton } from "@/components/commerce/paper-button";
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
      <form action="/admin/products/mutate" method="post" className="mt-8 grid max-w-2xl gap-4 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
        <input type="hidden" name="intent" value="create-product" />
        <AdminField label="Name *">
          <input name="name" required className={adminFieldClass} />
        </AdminField>
        <AdminField label="Slug (optional)">
          <input name="slug" className={adminFieldClass} placeholder="auto from name" />
        </AdminField>
        <AdminField label="Brand *">
          <select name="brandId" required className={adminFieldClass}>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </AdminField>
        <AdminField label="Category *">
          <select name="categoryId" required className={adminFieldClass}>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </AdminField>
        <AdminField label="Type">
          <select name="productType" className={adminFieldClass} defaultValue="standard">
            <option value="standard">Standard</option>
            <option value="bundle">Office pack</option>
          </select>
        </AdminField>
        <AdminField label="Status">
          <select name="status" className={adminFieldClass} defaultValue="draft">
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </AdminField>
        <AdminField label="Description">
          <textarea name="description" className={adminAreaClass} />
        </AdminField>
        <AdminField label="First SKU *">
          <input name="sku" required className={adminFieldClass} />
        </AdminField>
        <AdminField label="Unit label">
          <input name="unitLabel" className={adminFieldClass} defaultValue="each" />
        </AdminField>
        <AdminField label="Base unit price (GHS) *">
          <input name="baseUnitPrice" required className={adminFieldClass} placeholder="78.99" />
        </AdminField>
        <SubmitProgressButton
          idleLabel="Create product"
          pendingLabel="Creating product…"
          className={paperButton()}
        />
      </form>
    </main>
  );
}
