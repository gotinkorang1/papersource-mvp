import type { Metadata } from "next";
import Link from "next/link";
import { listAdminOrders } from "@/features/orders/queries";
import { formatGhs } from "@/lib/money";
import { requireStaffArea } from "@/lib/staff/require";

export const metadata: Metadata = {
  title: "Orders",
};

export default async function AdminOrdersPage() {
  const actor = await requireStaffArea("orders", "read");
  const rows = await listAdminOrders(actor.role);

  return (
    <main>
      <p className="text-sm tracking-[0.16em] text-slate uppercase">Commerce</p>
      <h1 className="mt-2 font-heading text-3xl text-ink">Orders</h1>
      {rows.length === 0 ? (
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
              {rows.map((row) => (
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
