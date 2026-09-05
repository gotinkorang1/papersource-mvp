import type { Metadata } from "next";
import { listAdminPayments } from "@/features/admin/queries";
import { AdminStatusBadge } from "@/components/admin/status-badge";
import { formatGhs } from "@/lib/money";
import { requireStaffArea } from "@/lib/staff/require";

export const metadata: Metadata = { title: "Payments" };

export default async function AdminPaymentsPage() {
  const actor = await requireStaffArea("payments", "read");
  const rows = await listAdminPayments(actor.role);
  return <main><p className="text-sm tracking-[0.16em] text-slate uppercase">Operations</p><h1 className="mt-2 font-heading text-3xl text-ink">Payments</h1><p className="mt-3 text-slate">Provider status and references only; raw Paystack payloads remain server-only.</p>{rows.length === 0 ? <p className="mt-8 text-slate">No payments yet.</p> : <div className="mt-8 overflow-x-auto rounded-md border border-border bg-white"><table className="w-full text-sm"><caption className="sr-only">Payments</caption><thead><tr className="border-b border-border text-left text-slate"><th className="px-4 py-3 font-medium">Order</th><th className="px-4 py-3 font-medium">Provider</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Amount</th><th className="px-4 py-3 font-medium">Reference</th><th className="px-4 py-3 font-medium">Received</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id} className="border-b border-border last:border-0"><td className="px-4 py-3">{row.orderNumber}</td><td className="px-4 py-3 capitalize">{row.provider.replaceAll("_", " ")}</td><td className="px-4 py-3"><AdminStatusBadge status={row.status} /></td><td className="px-4 py-3 tabular-nums">{formatGhs(row.amount)}</td><td className="px-4 py-3 font-mono text-xs">{row.reference ?? "—"}</td><td className="px-4 py-3 text-slate">{row.createdAt.toLocaleDateString("en-GH")}</td></tr>)}</tbody></table></div>}</main>;
}
