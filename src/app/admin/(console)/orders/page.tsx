import type { Metadata } from "next";
import Link from "next/link";
import { listAdminOrders } from "@/features/orders/queries";
import { formatGhs } from "@/lib/money";
import { requireStaffArea } from "@/lib/staff/require";

export const metadata: Metadata = {
  title: "Orders",
};

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ status?: string; source?: string }> }) {
  const actor = await requireStaffArea("orders", "read");
  const rows = await listAdminOrders(actor.role);
  const filters = await searchParams;
  const filteredRows = rows.filter((row) => (!filters.status || row.status === filters.status) && (!filters.source || row.source === filters.source));

  return (
    <main>
      <p className="text-sm tracking-[0.16em] text-slate uppercase">Commerce</p>
      <h1 className="mt-2 font-heading text-3xl text-ink">Orders</h1>
      <form method="get" className="mt-6 flex flex-wrap items-end gap-3 rounded-md border border-border bg-white p-4"><label className="grid gap-1 text-xs font-medium text-slate">Status<select name="status" defaultValue={filters.status ?? ""} className="h-9 rounded-md border border-border bg-cream px-2 text-sm text-ink"><option value="">All statuses</option>{["pending_payment","awaiting_terms","paid","processing","out_for_delivery","delivered","cancelled"].map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}</select></label><label className="grid gap-1 text-xs font-medium text-slate">Source<select name="source" defaultValue={filters.source ?? ""} className="h-9 rounded-md border border-border bg-cream px-2 text-sm text-ink"><option value="">All sources</option><option value="cart">Cart</option><option value="quote">Quote</option></select></label><button type="submit" className="h-9 rounded-md bg-primary px-4 text-xs font-semibold text-primary-foreground">Apply filters</button>{filters.status || filters.source ? <Link href="/admin/orders" className="text-xs text-slate underline">Clear</Link> : null}</form>
      {filteredRows.length === 0 ? (
        <p className="mt-8 text-slate">No orders yet.</p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-md border border-border bg-white">
          <table className="w-full text-sm">
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
