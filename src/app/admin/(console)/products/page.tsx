import type { Metadata } from "next";
import Link from "next/link";
import { listAdminProducts } from "@/features/catalogue/admin";
import { paperButton } from "@/components/commerce/paper-button";
import { canAccessAdmin } from "@/lib/staff/rbac";
import { requireStaffArea } from "@/lib/staff/require";

export const metadata: Metadata = {
  title: "Products",
};

export default async function AdminProductsPage() {
  const actor = await requireStaffArea("products", "read");
  const rows = await listAdminProducts();
  const canWrite = canAccessAdmin(actor.role, "products", "write");

  return (
    <main>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm tracking-[0.16em] text-slate uppercase">Catalogue</p>
          <h1 className="mt-2 font-heading text-3xl text-ink">Products</h1>
          <p className="mt-3 max-w-2xl text-slate">
            Merchandize the shared catalogue here. List prices still come from
            variants and tiers on the server.
          </p>
        </div>
        {canWrite ? (
          <Link href="/admin/products/new" className={paperButton()}>
            New product
          </Link>
        ) : null}
      </div>
      {rows.length === 0 ? (
        <p className="mt-8 text-slate">No products yet.</p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-md border border-border bg-white">
          <table className="w-full text-sm">
            <caption className="sr-only">Catalogue products</caption>
            <thead>
              <tr className="border-b border-border text-left text-slate">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Brand</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/admin/products/${row.id}`} className="underline">
                      {row.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{row.brandName}</td>
                  <td className="px-4 py-3">{row.categoryName}</td>
                  <td className="px-4 py-3">{row.productType}</td>
                  <td className="px-4 py-3">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
