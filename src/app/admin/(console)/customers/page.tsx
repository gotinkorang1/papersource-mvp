import type { Metadata } from "next";
import Link from "next/link";
import { listAdminCustomers } from "@/features/admin/queries";
import { requireStaffArea } from "@/lib/staff/require";

export const metadata: Metadata = { title: "Customers" };

export default async function AdminCustomersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const actor = await requireStaffArea("customers", "read");
  const filters = await searchParams;
  const rows = await listAdminCustomers(actor.role, filters.q);
 return <main><p className="text-sm tracking-[0.16em] text-slate uppercase">Commerce</p><h1 className="mt-2 font-heading text-3xl text-ink">Customers <span className="text-base font-normal text-slate">({rows.length})</span></h1><p className="mt-3 text-slate">Authenticated customer profiles, excluding staff identities.</p><form method="get" className="mt-6 flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-4"><label className="grid min-w-0 flex-1 gap-1 text-xs font-medium text-slate">Search customers<input name="q" defaultValue={filters.q ?? ""} placeholder="Name, email or phone" className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-ink" /></label><button type="submit" className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">Search</button>{filters.q ? <Link href="/admin/customers" className="pb-2 text-xs text-slate underline">Clear</Link> : null}</form>{rows.length === 0 ? <p className="mt-8 text-slate">No customer profiles match this search.</p> : <div className="mt-8 overflow-x-auto rounded-xl border border-border bg-card"><table className="w-full min-w-[36rem] text-sm"><caption className="sr-only">Customers</caption><thead><tr className="border-b border-border text-left text-slate"><th className="px-4 py-3 font-medium">Name</th><th className="px-4 py-3 font-medium">Email</th><th className="px-4 py-3 font-medium">Phone</th><th className="px-4 py-3 font-medium">Last updated</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id} className="border-b border-border transition-colors hover:bg-muted/40 last:border-0"><td className="px-4 py-3 font-medium text-ink"><Link href={`/admin/customers/${row.id}`} className="underline underline-offset-2">{row.fullName}</Link></td><td className="px-4 py-3">{row.email}</td><td className="px-4 py-3">{row.phone ?? "—"}</td><td className="px-4 py-3 text-slate">{row.updatedAt.toLocaleDateString("en-GH")}</td></tr>)}</tbody></table></div>}</main>;
}
