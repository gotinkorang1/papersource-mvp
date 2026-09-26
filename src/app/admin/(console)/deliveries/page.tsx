import type { Metadata } from "next";
import Link from "next/link";
import { AdminStatusBadge } from "@/components/admin/status-badge";
import { SubmitProgressButton } from "@/components/admin/submit-progress-button";
import { listAdminDeliveries } from "@/features/admin/queries";
import { formatGhs } from "@/lib/money";
import { requireStaffArea } from "@/lib/staff/require";

export const metadata: Metadata = { title: "Deliveries" };

export default async function AdminDeliveriesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; sort?: string }>;
}) {
  const actor = await requireStaffArea("deliveries", "read");
  const filters = await searchParams;
  const rows = await listAdminDeliveries(actor.role, filters);

  return (
    <main>
      <p className="text-sm tracking-[0.16em] text-slate uppercase">Operations</p>
      <h1 className="mt-2 font-heading text-3xl text-ink">Deliveries</h1>
      <p className="mt-3 text-slate">Order fulfilment queue by zone and current status. Status changes remain in the existing order desk.</p>
      <form method="get" className="mt-6 grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-[minmax(0,1fr)_12rem_12rem_auto] sm:items-end">
        <label className="grid gap-1 text-xs font-medium text-slate">Search deliveries<input name="q" defaultValue={filters.q ?? ""} placeholder="Order, zone or customer email" className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-ink" /></label>
        <label className="grid gap-1 text-xs font-medium text-slate">Status<select name="status" defaultValue={filters.status ?? ""} className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-ink"><option value="">All statuses</option>{["pending_payment", "awaiting_terms", "paid", "processing", "out_for_delivery", "delivered", "cancelled"].map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}</select></label>
        <label className="grid gap-1 text-xs font-medium text-slate">Sort by<select name="sort" defaultValue={filters.sort ?? "updated"} className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-ink"><option value="updated">Recently updated</option><option value="status">Status</option></select></label>
        <div className="flex items-center gap-3"><SubmitProgressButton idleLabel="Filter" pendingLabel="Filtering…" className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground" />{filters.q || filters.status || filters.sort ? <Link href="/admin/deliveries" className="text-xs text-slate underline">Clear</Link> : null}</div>
      </form>
      {rows.length === 0 ? <p className="mt-8 rounded-lg border border-border bg-card p-6 text-slate">No deliveries match these filters.</p> : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <table className="admin-responsive-table w-full min-w-[760px] text-sm">
            <caption className="sr-only">Deliveries</caption>
            <thead className="bg-muted/60"><tr className="border-b border-border text-left text-slate"><th scope="col" className="px-4 py-3 font-medium">Order</th><th scope="col" className="px-4 py-3 font-medium">Zone</th><th scope="col" className="px-4 py-3 font-medium">Status</th><th scope="col" className="px-4 py-3 font-medium">Total</th><th scope="col" className="px-4 py-3 font-medium">Customer</th><th scope="col" className="px-4 py-3 font-medium">Updated</th></tr></thead>
            <tbody>{rows.map((row) => <tr key={row.id} className="border-b border-border transition-colors hover:bg-muted/40 last:border-0"><td className="px-4 py-3" data-label="Order"><Link href={`/admin/orders/${row.id}`} className="font-medium text-ink underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">{row.number}</Link></td><td className="px-4 py-3" data-label="Zone">{row.zoneName}<span className="block text-xs text-slate">{row.zoneRegion}</span></td><td className="px-4 py-3" data-label="Status"><AdminStatusBadge status={row.status} /></td><td className="px-4 py-3 tabular-nums" data-label="Total">{formatGhs(row.grandTotal)}</td><td className="px-4 py-3" data-label="Customer">{row.customerEmail ?? "Guest"}</td><td className="px-4 py-3 text-slate" data-label="Updated">{row.updatedAt.toLocaleDateString("en-GH")}</td></tr>)}</tbody>
          </table>
        </div>
      )}
    </main>
  );
}
