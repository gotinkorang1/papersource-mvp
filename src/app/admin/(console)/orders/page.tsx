import type { Metadata } from "next";
import Link from "next/link";
import { listAdminOrders } from "@/features/orders/queries";
import { formatGhs } from "@/lib/money";
import { requireStaffArea } from "@/lib/staff/require";

export const metadata: Metadata = {
  title: "Orders",
};

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; source?: string; sort?: string }> }) {
  const actor = await requireStaffArea("orders", "read");
  const filters = await searchParams;
  const filteredRows = await listAdminOrders(actor.role, { search: filters.q, status: filters.status, source: filters.source, sort: filters.sort });

  return (
    <main>
      <p className="text-sm tracking-[0.16em] text-slate uppercase">Commerce</p>
      <h1 className="mt-2 font-heading text-3xl text-ink">Orders</h1>
      <form method="get" className="mt-6 grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-[minmax(0,1fr)_11rem_10rem_11rem_auto] sm:items-end"><label className="grid gap-1 text-xs font-medium text-slate">Search orders<input name="q" defaultValue={filters.q ?? ""} placeholder="Order number or notes" className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-ink" /></label><label className="grid gap-1 text-xs font-medium text-slate">Status<select name="status" defaultValue={filters.status ?? ""} className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-ink"><option value="">All statuses</option>{["pending_payment","awaiting_terms","paid","processing","out_for_delivery","delivered","cancelled"].map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}</select></label><label className="grid gap-1 text-xs font-medium text-slate">Source<select name="source" defaultValue={filters.source ?? ""} className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-ink"><option value="">All sources</option><option value="cart">Cart</option><option value="quote">Quote</option></select></label><label className="grid gap-1 text-xs font-medium text-slate">Sort by<select name="sort" defaultValue={filters.sort ?? "updated"} className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-ink"><option value="updated">Recently updated</option><option value="total">Highest total</option><option value="status">Status</option></select></label><div className="flex items-center gap-3"><button type="submit" className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">Filter</button>{filters.q || filters.status || filters.source || filters.sort ? <Link href="/admin/orders" className="text-xs text-slate underline">Clear</Link> : null}</div></form>
      {filteredRows.length === 0 ? (
        <p className="mt-8 text-slate">No orders yet.</p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[48rem] text-sm">
            <caption className="sr-only">Orders</caption>
            <thead>
              <tr className="border-b border-border text-left text-slate">
                <th className="px-4 py-3 font-medium">Number</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${row.id}`} className="underline">
                      {row.number}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{row.source}</td>
                  <td className="px-4 py-3">{row.status.replaceAll("_", " ")}</td>
                  <td className="px-4 py-3 tabular-nums">{formatGhs(row.grandTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
