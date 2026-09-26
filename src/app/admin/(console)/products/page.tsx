import type { Metadata } from "next";
import Link from "next/link";
import { listAdminProducts } from "@/features/catalogue/admin";
import { paperButton } from "@/components/commerce/paper-button";
import { AdminProductsView } from "@/components/admin/admin-products-view";
import { SubmitProgressButton } from "@/components/admin/submit-progress-button";
import { canAccessAdmin } from "@/lib/staff/rbac";
import { requireStaffArea } from "@/lib/staff/require";

export const metadata: Metadata = {
  title: "Products",
};

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; sort?: string; page?: string; message?: string; error?: string }> }) {
  const actor = await requireStaffArea("products", "read");
  const filters = await searchParams;
  const result = await listAdminProducts({ search: filters.q, status: filters.status, sort: filters.sort, page: filters.page });
  const { rows } = result;
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
        <SubmitProgressButton idleLabel="Filter" pendingLabel="Filtering…" className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground" />
      </form>
      <p className="mt-3 text-sm text-slate" aria-live="polite">Showing {rows.length} of {result.total} {result.total === 1 ? "product" : "products"}{filters.q || filters.status ? " matching your filters" : ""}.</p>
      {rows.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-border bg-card p-6 text-sm text-slate"><p>{filters.q || filters.status ? "No products match these filters." : "No products yet."}</p>{filters.q || filters.status || filters.sort ? <Link href="/admin/products" className="mt-2 inline-flex text-ink underline underline-offset-4">Clear filters</Link> : null}</div>
      ) : <AdminProductsView rows={rows} canWrite={canWrite} />}
      {result.totalPages > 1 ? <nav className="mt-6 flex flex-wrap items-center justify-between gap-3" aria-label="Product pages"><p className="text-sm text-slate">Page {result.page} of {result.totalPages}</p><div className="flex gap-2">{result.page > 1 ? <Link href={{ pathname: "/admin/products", query: { q: filters.q, status: filters.status, sort: filters.sort, page: String(result.page - 1) } }} className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-ink hover:bg-muted">Previous</Link> : null}{result.page < result.totalPages ? <Link href={{ pathname: "/admin/products", query: { q: filters.q, status: filters.status, sort: filters.sort, page: String(result.page + 1) } }} className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-ink hover:bg-muted">Next</Link> : null}</div></nav> : null}
    </main>
  );
}
