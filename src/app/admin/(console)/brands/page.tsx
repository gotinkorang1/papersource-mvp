import type { Metadata } from "next";
import Link from "next/link";
import { AdminError, AdminField, adminFieldClass } from "@/components/admin/field";
import { SelectAllCheckbox } from "@/components/admin/select-all-checkbox";
import { SubmitProgressButton } from "@/components/admin/submit-progress-button";
import { paperButton } from "@/components/commerce/paper-button";
import { listAdminBrands } from "@/features/catalogue/admin";
import { canAccessAdmin } from "@/lib/staff/rbac";
import { requireStaffArea } from "@/lib/staff/require";

export const metadata: Metadata = {
  title: "Brands",
};

type PageProps = {
  searchParams: Promise<{ error?: string; q?: string; message?: string; sort?: string }>;
};

export default async function AdminBrandsPage({ searchParams }: PageProps) {
  const actor = await requireStaffArea("brands", "read");
  const allRows = await listAdminBrands();
  const canWrite = canAccessAdmin(actor.role, "brands", "write");
  const { error, q = "", message, sort = "name" } = await searchParams;
  const query = q.trim().toLocaleLowerCase();
  const filteredRows = query ? allRows.filter((row) => `${row.name} ${row.slug}`.toLocaleLowerCase().includes(query)) : allRows;
  const rows = [...filteredRows].sort((a, b) => sort === "slug" ? a.slug.localeCompare(b.slug) : a.name.localeCompare(b.name));

  return (
    <main>
      <p className="text-sm tracking-[0.16em] text-slate uppercase">Catalogue</p>
      <h1 className="mt-2 font-heading text-3xl text-ink">Brands</h1>
      <p className="mt-3 max-w-2xl text-slate">
        Brand pages use these slugs. Keep PaperSource and supplier names here.
      </p>
      <AdminError error={error} />
      {message ? <p role="status" className="mt-4 rounded-md border border-paper-green/30 bg-paper-green/10 px-4 py-3 text-sm text-paper-green">{message}</p> : null}
      <form className="mt-6 flex flex-wrap gap-2" method="get"><label className="sr-only" htmlFor="brand-search">Search brands</label><input id="brand-search" name="q" defaultValue={q} className={`${adminFieldClass} min-w-[16rem] flex-1`} placeholder="Search brands or slugs" /><select name="sort" defaultValue={sort} className={adminFieldClass}><option value="name">Sort: name</option><option value="slug">Sort: slug</option></select><button className={paperButton({ variant: "secondary" })}>Search</button>{q || sort !== "name" ? <Link href="/admin/brands" className="self-center text-sm text-slate underline">Clear</Link> : null}</form>
      <form action="/admin/brands/mutate" method="post" className="mt-8 overflow-x-auto rounded-xl border border-border bg-card">{canWrite ? <><input type="hidden" name="intent" value="bulk-active" /><div className="flex flex-wrap items-center gap-3 border-b border-border bg-muted/30 p-3"><SelectAllCheckbox count={rows.length} name="brandId" label="brands" /><select name="active" defaultValue="true" className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-ink"><option value="true">Set active</option><option value="false">Set inactive</option></select><SubmitProgressButton idleLabel="Apply to selected" pendingLabel="Updating brands…" className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground" /><span className="text-xs text-slate" aria-live="polite">Bulk updates only change visibility.</span></div></> : null}
        <table className="admin-responsive-table w-full min-w-[38rem] text-sm">
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
            {rows.length === 0 ? <tr><td colSpan={canWrite ? 4 : 3} className="px-4 py-8 text-center text-sm text-slate">{q ? "No brands match this search." : "No brands yet."}</td></tr> : rows.map((row) => (
              <tr key={row.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3" data-label="Name">{canWrite ? <input type="checkbox" name="brandId" value={row.id} aria-label={`Select ${row.name}`} className="mr-3 size-4 align-middle accent-primary" /> : null}{row.name}</td>
                <td className="px-4 py-3 font-mono text-xs" data-label="Slug">{row.slug}</td>
                <td className="px-4 py-3" data-label="Active">{row.active ? "Yes" : "No"}</td>
                {canWrite ? <td className="px-4 py-3" data-label="Actions"><a href={`#brand-${row.id}`} className="font-semibold text-paper-green underline">Edit</a></td> : null}
              </tr>
            ))}
          </tbody>
        </table>
      </form>
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
