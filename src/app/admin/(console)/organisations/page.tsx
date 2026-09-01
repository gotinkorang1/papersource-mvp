import type { Metadata } from "next";
import { listAdminOrganisations } from "@/features/admin/queries";
import { requireStaffArea } from "@/lib/staff/require";

export const metadata: Metadata = { title: "Organisations" };

export default async function AdminOrganisationsPage() {
  const actor = await requireStaffArea("organisations", "read");
  const rows = await listAdminOrganisations(actor.role);
  return <main><p className="text-sm tracking-[0.16em] text-slate uppercase">Commerce</p><h1 className="mt-2 font-heading text-3xl text-ink">Organisations</h1><p className="mt-3 text-slate">Saved business identities and their current account membership.</p>{rows.length === 0 ? <p className="mt-8 text-slate">No organisations yet.</p> : <div className="mt-8 overflow-x-auto rounded-md border border-border bg-white"><table className="w-full text-sm"><caption className="sr-only">Organisations</caption><thead><tr className="border-b border-border text-left text-slate"><th className="px-4 py-3 font-medium">Organisation</th><th className="px-4 py-3 font-medium">Type</th><th className="px-4 py-3 font-medium">Contact</th><th className="px-4 py-3 font-medium">Members</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id} className="border-b border-border last:border-0"><td className="px-4 py-3">{row.name}</td><td className="px-4 py-3 capitalize">{row.type}</td><td className="px-4 py-3">{row.email ?? row.phone ?? "—"}</td><td className="px-4 py-3 tabular-nums">{row.memberCount}</td></tr>)}</tbody></table></div>}</main>;
}
