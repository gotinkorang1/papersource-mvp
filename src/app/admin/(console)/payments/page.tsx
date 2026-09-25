import type { Metadata } from "next";
import Link from "next/link";
import { AdminStatusBadge } from "@/components/admin/status-badge";
import { listAdminPayments } from "@/features/admin/queries";
import { formatGhs } from "@/lib/money";
import { requireStaffArea } from "@/lib/staff/require";

export const metadata: Metadata = { title: "Payments" };

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; provider?: string; sort?: string }>;
}) {
  const actor = await requireStaffArea("payments", "read");
  const filters = await searchParams;
  const rows = await listAdminPayments(actor.role, filters);

  return (
    <main>
      <p className="text-sm tracking-[0.16em] text-slate uppercase">Operations</p>
      <h1 className="mt-2 font-heading text-3xl text-ink">Payments</h1>
      <p className="mt-3 text-slate">Provider status and references only; raw Paystack payloads remain server-only.</p>
      <form method="get" className="mt-6 grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-[minmax(0,1fr)_11rem_11rem_11rem_auto] sm:items-end">
        <label className="grid gap-1 text-xs font-medium text-slate">Search payments<input name="q" defaultValue={filters.q ?? ""} placeholder="Order, email or reference" className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-ink" /></label>
        <label className="grid gap-1 text-xs font-medium text-slate">Status<select name="status" defaultValue={filters.status ?? ""} className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-ink"><option value="">All statuses</option>{["initialized", "pending", "success", "failed", "abandoned"].map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
        <label className="grid gap-1 text-xs font-medium text-slate">Provider<select name="provider" defaultValue={filters.provider ?? ""} className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-ink"><option value="">All providers</option>{["paystack", "bank_transfer", "purchase_order", "invoice_terms"].map((provider) => <option key={provider} value={provider}>{provider.replaceAll("_", " ")}</option>)}</select></label>
        <label className="grid gap-1 text-xs font-medium text-slate">Sort by<select name="sort" defaultValue={filters.sort ?? "updated"} className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-ink"><option value="updated">Newest</option><option value="amount">Highest amount</option></select></label>
        <div className="flex items-center gap-3"><button type="submit" className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">Filter</button>{filters.q || filters.status || filters.provider || filters.sort ? <Link href="/admin/payments" className="text-xs text-slate underline">Clear</Link> : null}</div>
      </form>
      {rows.length === 0 ? <p className="mt-8 text-slate">No payments match these filters.</p> : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-border bg-card">
          <table className="admin-responsive-table w-full text-sm">
            <caption className="sr-only">Payments</caption>
            <thead><tr className="border-b border-border text-left text-slate"><th scope="col" className="px-4 py-3 font-medium">Order</th><th scope="col" className="px-4 py-3 font-medium">Provider</th><th scope="col" className="px-4 py-3 font-medium">Status</th><th scope="col" className="px-4 py-3 font-medium">Amount</th><th scope="col" className="px-4 py-3 font-medium">Reference</th><th scope="col" className="px-4 py-3 font-medium">Received</th></tr></thead>
            <tbody>{rows.map((row) => <tr key={row.id} className="border-b border-border transition-colors hover:bg-muted/40 last:border-0"><td className="px-4 py-3" data-label="Order">{row.orderNumber}</td><td className="px-4 py-3 capitalize" data-label="Provider">{row.provider.replaceAll("_", " ")}</td><td className="px-4 py-3" data-label="Status"><AdminStatusBadge status={row.status} /></td><td className="px-4 py-3 tabular-nums" data-label="Amount">{formatGhs(row.amount)}</td><td className="px-4 py-3 font-mono text-xs" data-label="Reference">{row.reference ?? "—"}</td><td className="px-4 py-3 text-slate" data-label="Received">{row.createdAt.toLocaleDateString("en-GH")}</td></tr>)}</tbody>
          </table>
        </div>
      )}
    </main>
  );
}
