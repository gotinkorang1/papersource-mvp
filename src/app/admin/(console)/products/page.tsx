import type { Metadata } from "next";
import Link from "next/link";
import { listAdminProducts } from "@/features/catalogue/admin";
import { paperButton } from "@/components/commerce/paper-button";
import { SelectAllCheckbox } from "@/components/admin/select-all-checkbox";
import { SubmitProgressButton } from "@/components/admin/submit-progress-button";
import { canAccessAdmin } from "@/lib/staff/rbac";
import { requireStaffArea } from "@/lib/staff/require";

export const metadata: Metadata = {
  title: "Products",
};

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; sort?: string; message?: string; error?: string }> }) {
  const actor = await requireStaffArea("products", "read");
  const filters = await searchParams;
  const rows = await listAdminProducts({ search: filters.q, status: filters.status, sort: filters.sort });
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
      {filters.message ? <p className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{filters.message}</p> : null}
      {filters.error ? <p className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{filters.error}</p> : null}
      <form method="get" className="mt-7 grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-[minmax(0,1fr)_10rem_11rem_auto] sm:items-end">
        <label className="grid gap-1 text-xs font-medium text-slate">Search products<input name="q" defaultValue={filters.q ?? ""} placeholder="Name, SKU, brand or category" className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-ink" /></label>
        <label className="grid gap-1 text-xs font-medium text-slate">Status<select name="status" defaultValue={filters.status ?? ""} className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-ink"><option value="">All statuses</option><option value="active">Active</option><option value="draft">Draft</option><option value="archived">Archived</option></select></label>
        <label className="grid gap-1 text-xs font-medium text-slate">Sort by<select name="sort" defaultValue={filters.sort ?? "updated"} className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-ink"><option value="updated">Recently updated</option><option value="name">Name</option><option value="status">Status</option></select></label>
        <button type="submit" className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">Filter</button>
      </form>
      {rows.length === 0 ? (
        <p className="mt-8 text-slate">No products yet.</p>
      ) : (
        <form action="/admin/products/mutate" method="post" className="mt-8 overflow-x-auto rounded-xl border border-border bg-card">
          {canWrite ? <div className="flex flex-wrap items-center gap-3 border-b border-border bg-muted/30 p-3"><input type="hidden" name="intent" value="bulk-update-products" /><label className="sr-only" htmlFor="bulk-status">Bulk action</label><select id="bulk-status" name="status" defaultValue="draft" className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-ink"><option value="active">Set active</option><option value="draft">Set draft</option><option value="archived">Archive</option></select><SubmitProgressButton idleLabel="Apply to selected" pendingLabel="Updating products…" className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground" /><span className="text-xs text-slate" aria-live="polite">Select products below to update them together.</span></div> : null}
          <table className="w-full min-w-[52rem] text-sm">
            <caption className="sr-only">Catalogue products</caption>
            <thead>
              <tr className="border-b border-border text-left text-slate">
                {canWrite ? <th className="w-12 px-4 py-3"><SelectAllCheckbox count={rows.length} /></th> : null}
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
                  {canWrite ? <td className="px-4 py-3"><input type="checkbox" name="productId" value={row.id} aria-label={`Select ${row.name}`} className="size-4 rounded border-border accent-primary" /></td> : null}
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
        </form>
      )}
    </main>
  );
}
