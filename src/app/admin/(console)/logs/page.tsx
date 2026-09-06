import type { Metadata } from "next";
import { listAdminAuditLogs } from "@/features/admin/queries";
import { requireStaffArea } from "@/lib/staff/require";

export const metadata: Metadata = { title: "Audit logs" };

export default async function AdminLogsPage() {
  const actor = await requireStaffArea("logs", "read");
  let rows;
  try {
    rows = await listAdminAuditLogs(actor.role);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "42P01") {
      return <main><p className="text-sm tracking-[0.16em] text-slate uppercase">System</p><h1 className="mt-2 font-heading text-3xl text-ink">Audit logs</h1><p className="mt-4 rounded-md border border-ochre/40 bg-ochre/10 px-4 py-3 text-sm text-ink">Audit storage is not initialized yet. Apply <code>drizzle/0011_audit_logs.sql</code> to the production database.</p></main>;
    }
    throw error;
  }
  return <main className="max-w-6xl"><p className="text-sm tracking-[0.16em] text-slate uppercase">System</p><h1 className="mt-2 font-heading text-3xl text-ink">Audit logs</h1><p className="mt-3 text-slate">Recent staff actions across the PaperSource operating desks.</p>{rows.length === 0 ? <p className="mt-8 rounded-lg border border-border bg-surface p-6 text-slate">No staff actions recorded yet.</p> : <div className="mt-8 overflow-x-auto rounded-xl border border-border bg-surface shadow-sm"><table className="w-full min-w-[680px] text-sm"><caption className="sr-only">Audit logs</caption><thead className="bg-muted/60"><tr className="border-b border-border text-left text-slate"><th className="px-4 py-3 font-medium">When</th><th className="px-4 py-3 font-medium">Actor</th><th className="px-4 py-3 font-medium">Action</th><th className="px-4 py-3 font-medium">Resource</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id} className="border-b border-border transition-colors hover:bg-muted/40 last:border-0"><td className="whitespace-nowrap px-4 py-3 text-slate">{row.createdAt.toLocaleString("en-GH")}</td><td className="px-4 py-3"><span className="font-medium text-ink">{row.actorName ?? "System"}</span>{row.actorEmail ? <span className="block text-xs text-slate">{row.actorEmail}</span> : null}</td><td className="px-4 py-3 capitalize text-ink">{row.action.replaceAll("_", " ")}</td><td className="px-4 py-3 text-slate">{row.resourceType}{row.resourceId ? ` · ${row.resourceId}` : ""}</td></tr>)}</tbody></table></div>}</main>;
}
