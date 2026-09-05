import type { Metadata } from "next";
import Link from "next/link";
import { listAdminDeliveries } from "@/features/admin/queries";
import { AdminStatusBadge } from "@/components/admin/status-badge";
import { formatGhs } from "@/lib/money";
import { requireStaffArea } from "@/lib/staff/require";

export const metadata: Metadata = { title: "Deliveries" };

export default async function AdminDeliveriesPage() {
  const actor = await requireStaffArea("deliveries", "read");
  const rows = await listAdminDeliveries(actor.role);
  return <main><p className="text-sm tracking-[0.16em] text-slate uppercase">Operations</p><h1 className="mt-2 font-heading text-3xl text-ink">Deliveries</h1><p className="mt-3 text-slate">Order fulfilment queue by zone and current status. Status changes remain in the existing order desk.</p>{rows.length === 0 ? <p className="mt-8 text-slate">No deliveries yet.</p> : <div className="mt-8 overflow-x-auto rounded-md border border-border bg-white"><table className="w-full text-sm"><caption className="sr-only">Deliveries</caption><thead><tr className="border-b border-border text-left text-slate"><th className="px-4 py-3 font-medium">Order</th><th className="px-4 py-3 font-medium">Zone</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Total</th><th className="px-4 py-3 font-medium">Customer</th><th className="px-4 py-3 font-medium">Updated</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id} className="border-b border-border last:border-0"><td className="px-4 py-3"><Link href={`/admin/orders/${row.id}`} className="font-medium text-ink underline underline-offset-2">{row.number}</Link></td><td className="px-4 py-3">{row.zoneName}<span className="block text-xs text-slate">{row.zoneRegion}</span></td><td className="px-4 py-3"><AdminStatusBadge status={row.status} /></td><td className="px-4 py-3 tabular-nums">{formatGhs(row.grandTotal)}</td><td className="px-4 py-3">{row.customerEmail ?? "Guest"}</td><td className="px-4 py-3 text-slate">{row.updatedAt.toLocaleDateString("en-GH")}</td></tr>)}</tbody></table></div>}</main>;
}
