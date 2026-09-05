import type { Metadata } from "next";
import { listAdminCustomers } from "@/features/admin/queries";
import { requireStaffArea } from "@/lib/staff/require";

export const metadata: Metadata = { title: "Customers" };

export default async function AdminCustomersPage() {
  const actor = await requireStaffArea("customers", "read");
  const rows = await listAdminCustomers(actor.role);
  return <main><p className="text-sm tracking-[0.16em] text-slate uppercase">Commerce</p><h1 className="mt-2 font-heading text-3xl text-ink">Customers <span className="text-base font-normal text-slate">({rows.length})</span></h1><p className="mt-3 text-slate">Authenticated customer profiles, excluding staff identities.</p>{rows.length === 0 ? <p className="mt-8 text-slate">No customer profiles yet.</p> : <div className="mt-8 overflow-x-auto rounded-md border border-border bg-white"><table className="w-full text-sm"><caption className="sr-only">Customers</caption><thead><tr className="border-b border-border text-left text-slate"><th className="px-4 py-3 font-medium">Name</th><th className="px-4 py-3 font-medium">Email</th><th className="px-4 py-3 font-medium">Phone</th><th className="px-4 py-3 font-medium">Last updated</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id} className="border-b border-border last:border-0"><td className="px-4 py-3 font-medium text-ink">{row.fullName}</td><td className="px-4 py-3">{row.email}</td><td className="px-4 py-3">{row.phone ?? "—"}</td><td className="px-4 py-3 text-slate">{row.updatedAt.toLocaleDateString("en-GH")}</td></tr>)}</tbody></table></div>}</main>;
}
