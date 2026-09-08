import type { Metadata } from "next";
import Link from "next/link";
import { AdminError, AdminField, adminFieldClass } from "@/components/admin/field";
import { SubmitProgressButton } from "@/components/admin/submit-progress-button";
import { paperButton } from "@/components/commerce/paper-button";
import { listAdminBrands } from "@/features/catalogue/admin";
import { canAccessAdmin } from "@/lib/staff/rbac";
import { requireStaffArea } from "@/lib/staff/require";

export const metadata: Metadata = {
  title: "Brands",
};

type PageProps = {
  searchParams: Promise<{ error?: string; q?: string }>;
};

export default async function AdminBrandsPage({ searchParams }: PageProps) {
  const actor = await requireStaffArea("brands", "read");
  const allRows = await listAdminBrands();
  const canWrite = canAccessAdmin(actor.role, "brands", "write");
  const { error, q = "" } = await searchParams;
  const query = q.trim().toLocaleLowerCase();
  const rows = query ? allRows.filter((row) => `${row.name} ${row.slug}`.toLocaleLowerCase().includes(query)) : allRows;

  return (
    <main>
      <p className="text-sm tracking-[0.16em] text-slate uppercase">Catalogue</p>
      <h1 className="mt-2 font-heading text-3xl text-ink">Brands</h1>
      <p className="mt-3 max-w-2xl text-slate">
        Brand pages use these slugs. Keep PaperSource and supplier names here.
      </p>
      <AdminError error={error} />
      <form className="mt-6 flex flex-wrap gap-2" method="get"><label className="sr-only" htmlFor="brand-search">Search brands</label><input id="brand-search" name="q" defaultValue={q} className={`${adminFieldClass} min-w-[16rem] flex-1`} placeholder="Search brands or slugs" /><button className={paperButton({ variant: "secondary" })}>Search</button>{q ? <Link href="/admin/brands" className="self-center text-sm text-slate underline">Clear</Link> : null}</form>
      <div className="mt-8 overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[38rem] text-sm">
          <caption className="sr-only">Brands</caption>
          <thead>
            <tr className="border-b border-border text-left text-slate">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Active</th>
              {canWrite ? <th className="px-4 py-3 font-medium">Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">{row.name}</td>
                <td className="px-4 py-3 font-mono text-xs">{row.slug}</td>
                <td className="px-4 py-3">{row.active ? "Yes" : "No"}</td>
                {canWrite ? <td className="px-4 py-3"><a href={`#brand-${row.id}`} className="font-semibold text-paper-green underline">Edit</a></td> : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {canWrite
        ? rows.map((row) => (
            <form
              key={row.id}
              id={`brand-${row.id}`}
              action="/admin/brands/mutate"
              method="post"
              className="mt-4 grid gap-3 rounded-xl border border-border bg-card p-5 sm:grid-cols-3"
            >
              <input type="hidden" name="intent" value="save-brand" />
              <input type="hidden" name="brandId" value={row.id} />
              <AdminField label="Name">
                <input name="name" required defaultValue={row.name} className={adminFieldClass} />
              </AdminField>
              <AdminField label="Slug">
                <input name="slug" required defaultValue={row.slug} className={adminFieldClass} />
              </AdminField>
              <AdminField label="Active">
                <select
                  name="active"
                  defaultValue={row.active ? "true" : "false"}
                  className={adminFieldClass}
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </AdminField>
              <div className="sm:col-span-3">
                <SubmitProgressButton idleLabel={`Save ${row.name}`} pendingLabel="Saving brand…" className={paperButton()} />
              </div>
            </form>
          ))
        : null}
      {canWrite ? (
        <form
          action="/admin/brands/mutate"
          method="post"
          className="mt-8 grid max-w-xl gap-3 rounded-xl border border-border bg-card p-5"
        >
          <h2 className="font-heading text-xl text-ink">New brand</h2>
          <input type="hidden" name="intent" value="create-brand" />
          <AdminField label="Name *">
            <input name="name" required className={adminFieldClass} />
          </AdminField>
          <AdminField label="Slug (optional)">
            <input name="slug" className={adminFieldClass} />
          </AdminField>
          <SubmitProgressButton idleLabel="Create brand" pendingLabel="Creating brand…" className={paperButton({ variant: "secondary" })} />
        </form>
      ) : null}
    </main>
  );
}
