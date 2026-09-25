import type { Metadata } from "next";
import Link from "next/link";
import { listAdminAuditLogs } from "@/features/admin/queries";
import { requireStaffArea } from "@/lib/staff/require";

export const metadata: Metadata = { title: "Audit logs" };

export default async function AdminLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; resourceType?: string }>;
}) {
  const actor = await requireStaffArea("logs", "read");
  const filters = await searchParams;
  let rows;
  try {
    rows = await listAdminAuditLogs(actor.role, filters);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "42P01") {
      return (
        <main>
          <p className="text-sm tracking-[0.16em] text-slate uppercase">System</p>
          <h1 className="mt-2 font-heading text-3xl text-ink">Audit logs</h1>
          <p className="mt-4 rounded-md border border-ochre/40 bg-ochre/10 px-4 py-3 text-sm text-ink">Audit storage is not initialized yet. Apply <code>drizzle/0011_audit_logs.sql</code> to the production database.</p>
        </main>
      );
    }
    throw error;
  }

  return (
    <main className="max-w-6xl">
      <p className="text-sm tracking-[0.16em] text-slate uppercase">System</p>
      <h1 className="mt-2 font-heading text-3xl text-ink">Audit logs</h1>
      <p className="mt-3 text-slate">Recent staff actions across the PaperSource operating desks.</p>
      <form className="mt-6 grid gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-[1fr_1fr_auto_auto]" method="get">
        <label className="text-sm text-slate">Action<input name="action" defaultValue={filters.action ?? ""} placeholder="e.g. quote" className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-ink outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/20" /></label>
        <label className="text-sm text-slate">Resource type<input name="resourceType" defaultValue={filters.resourceType ?? ""} placeholder="e.g. product" className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-ink outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/20" /></label>
        <button className="self-end rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink" type="submit">Filter</button>
        <Link className="self-end rounded-md border border-border px-4 py-2 text-center text-sm font-medium text-ink transition hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink" href="/admin/logs">Reset</Link>
      </form>
      {rows.length === 0 ? <p className="mt-8 rounded-lg border border-border bg-surface p-6 text-slate">No staff actions recorded yet.</p> : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
          <table className="admin-responsive-table w-full min-w-[680px] text-sm">
            <caption className="sr-only">Audit logs</caption>
            <thead className="bg-muted/60"><tr className="border-b border-border text-left text-slate"><th scope="col" className="px-4 py-3 font-medium">When</th><th scope="col" className="px-4 py-3 font-medium">Actor</th><th scope="col" className="px-4 py-3 font-medium">Action</th><th scope="col" className="px-4 py-3 font-medium">Resource</th></tr></thead>
            <tbody>{rows.map((row) => <tr key={row.id} className="border-b border-border transition-colors hover:bg-muted/40 last:border-0"><td className="whitespace-nowrap px-4 py-3 text-slate" data-label="When">{row.createdAt.toLocaleString("en-GH")}</td><td className="px-4 py-3" data-label="Actor"><span className="font-medium text-ink">{row.actorName ?? "System"}</span>{row.actorEmail ? <span className="block text-xs text-slate">{row.actorEmail}</span> : null}</td><td className="px-4 py-3 capitalize text-ink" data-label="Action">{row.action.replaceAll("_", " ")}</td><td className="px-4 py-3 text-slate" data-label="Resource">{row.resourceType}{row.resourceId ? ` · ${row.resourceId}` : ""}</td></tr>)}</tbody>
          </table>
        </div>
      )}
    </main>
  );
}
