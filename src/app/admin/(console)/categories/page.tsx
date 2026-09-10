import type { Metadata } from "next";
import Link from "next/link";
import { AdminError, AdminField, adminAreaClass, adminFieldClass } from "@/components/admin/field";
import { SelectAllCheckbox } from "@/components/admin/select-all-checkbox";
import { SubmitProgressButton } from "@/components/admin/submit-progress-button";
import { paperButton } from "@/components/commerce/paper-button";
import { listAdminCategories } from "@/features/catalogue/admin";
import { canAccessAdmin } from "@/lib/staff/rbac";
import { requireStaffArea } from "@/lib/staff/require";

export const metadata: Metadata = {
  title: "Categories",
};

type PageProps = {
  searchParams: Promise<{ error?: string; q?: string; message?: string; sort?: string }>;
};

export default async function AdminCategoriesPage({ searchParams }: PageProps) {
  const actor = await requireStaffArea("categories", "read");
  const allRows = await listAdminCategories();
  const canWrite = canAccessAdmin(actor.role, "categories", "write");
  const { error, q = "", message, sort = "position" } = await searchParams;
  const query = q.trim().toLocaleLowerCase();
  const filteredRows = query ? allRows.filter((row) => `${row.name} ${row.slug}`.toLocaleLowerCase().includes(query)) : allRows;
  const rows = [...filteredRows].sort((a, b) => sort === "name" ? a.name.localeCompare(b.name) : a.position - b.position || a.name.localeCompare(b.name));
  const categoryById = new Map(allRows.map((row) => [row.id, row]));
  const categoryPath = (row: (typeof allRows)[number]) => {
    const parts: string[] = [];
    const seen = new Set<string>();
    let current: (typeof allRows)[number] | undefined = row;
    while (current && !seen.has(current.id)) {
      seen.add(current.id);
      parts.unshift(current.name);
      current = current.parentId ? categoryById.get(current.parentId) : undefined;
    }
    return parts.join(" › ");
  };

  return (
    <main>
      <p className="text-sm tracking-[0.16em] text-slate uppercase">Catalogue</p>
      <h1 className="mt-2 font-heading text-3xl text-ink">Categories</h1>
      <p className="mt-3 max-w-2xl text-slate">
        Shop routes follow these slugs. Keep names operational, not decorative.
      </p>
      <AdminError error={error} />
      {message ? <p role="status" className="mt-4 rounded-md border border-paper-green/30 bg-paper-green/10 px-4 py-3 text-sm text-paper-green">{message}</p> : null}
      <form className="mt-6 flex flex-wrap gap-2" method="get"><label className="sr-only" htmlFor="category-search">Search categories</label><input id="category-search" name="q" defaultValue={q} className={`${adminFieldClass} min-w-[16rem] flex-1`} placeholder="Search categories or slugs" /><select name="sort" defaultValue={sort} className={adminFieldClass}><option value="position">Sort: position</option><option value="name">Sort: name</option></select><button className={paperButton({ variant: "secondary" })}>Search</button>{q || sort !== "position" ? <Link href="/admin/categories" className="self-center text-sm text-slate underline">Clear</Link> : null}</form>
      <p className="mt-3 text-sm text-slate" aria-live="polite">Showing {rows.length} {rows.length === 1 ? "category" : "categories"}{q ? " matching your search" : ""}.</p>
      {canWrite ? <form id="bulk-categories" action="/admin/categories/mutate" method="post" className="mt-6 flex flex-wrap items-center gap-3 rounded-t-xl border border-border bg-muted/30 p-3"><input type="hidden" name="intent" value="bulk-active" /><SelectAllCheckbox count={rows.length} name="categoryId" label="categories" /><select name="active" defaultValue="true" className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-ink"><option value="true">Set active</option><option value="false">Set inactive</option></select><SubmitProgressButton idleLabel="Apply to selected" pendingLabel="Updating categories…" className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground" /><span className="text-xs text-slate" aria-live="polite">Bulk updates only change visibility.</span></form> : null}
      <div className={`overflow-x-auto rounded-b-xl border border-border bg-card ${canWrite ? "border-t-0" : "mt-8 rounded-xl"}`}>
        <table className="admin-responsive-table w-full min-w-[42rem] text-sm">
          <caption className="sr-only">Categories</caption>
          <thead className="sticky top-0 z-10 bg-card">
            <tr className="border-b border-border text-left text-slate">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Active</th>
              {canWrite ? <th className="px-4 py-3 font-medium">Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? <tr><td colSpan={canWrite ? 4 : 3} className="px-4 py-8 text-center text-sm text-slate">{q ? "No categories match this search." : "No categories yet."}</td></tr> : rows.map((row) => (
              <tr key={row.id} className="border-b border-border transition-colors hover:bg-muted/40 last:border-0 align-top">
                <td className="px-4 py-3" data-label="Name">{canWrite ? <input form="bulk-categories" type="checkbox" name="categoryId" value={row.id} aria-label={`Select ${row.name}`} className="mr-3 size-4 align-middle accent-primary" /> : null}<span title={categoryPath(row)}>{categoryPath(row)}</span></td>
                <td className="px-4 py-3 font-mono text-xs" data-label="Slug">{row.slug}</td>
                <td className="px-4 py-3" data-label="Active">{row.active ? "Yes" : "No"}</td>
                {canWrite ? <td className="px-4 py-3" data-label="Actions"><a href={`#category-${row.id}`} className="font-semibold text-paper-green underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Edit below</a></td> : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {canWrite
        ? rows.map((row) => (
            <details
              key={row.id}
              id={`category-${row.id}`}
              className="mt-4 rounded-xl border border-border bg-card shadow-sm"
            >
              <summary className="cursor-pointer list-none px-5 py-4 font-medium text-ink marker:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Edit {row.name}<span className="float-right text-sm text-slate">Expand</span></summary>
              <form action="/admin/categories/mutate" method="post" className="grid gap-3 border-t border-border p-5 sm:grid-cols-2">
                <input type="hidden" name="intent" value="save-category" />
                <input type="hidden" name="categoryId" value={row.id} />
                <AdminField label="Name"><input name="name" required defaultValue={row.name} className={adminFieldClass} /></AdminField>
                <AdminField label="Slug"><input name="slug" required defaultValue={row.slug} className={adminFieldClass} /></AdminField>
                <AdminField label="Parent"><select name="parentId" defaultValue={row.parentId ?? ""} className={adminFieldClass}><option value="">None (division)</option>{allRows.filter((candidate) => candidate.id !== row.id).map((candidate) => <option key={candidate.id} value={candidate.id}>{categoryPath(candidate)}</option>)}</select></AdminField>
                <AdminField label="Position"><input name="position" defaultValue={String(row.position)} className={adminFieldClass} /></AdminField>
                <AdminField label="Active"><select name="active" defaultValue={row.active ? "true" : "false"} className={adminFieldClass}><option value="true">Yes</option><option value="false">No</option></select></AdminField>
                <AdminField label="Description"><textarea name="description" defaultValue={row.description ?? ""} className={adminAreaClass} /></AdminField>
                <AdminField label="Category image (Cloudinary public ID or URL)"><input name="imagePublicId" defaultValue={row.imagePublicId ?? ""} className={adminFieldClass} placeholder="papersource/categories/paper" /></AdminField>
                <div className="sm:col-span-2"><SubmitProgressButton idleLabel={`Save ${row.name}`} pendingLabel="Saving category…" className={paperButton()} /></div>
              </form>
            </details>
          ))
        : null}
      {canWrite ? (
        <form
          action="/admin/categories/mutate"
          method="post"
          className="mt-8 grid max-w-2xl gap-3 rounded-xl border border-border bg-card p-5"
        >
          <h2 className="font-heading text-xl text-ink">New category</h2>
          <input type="hidden" name="intent" value="create-category" />
          <AdminField label="Name *">
            <input name="name" required className={adminFieldClass} />
          </AdminField>
          <AdminField label="Slug (optional)">
            <input name="slug" className={adminFieldClass} />
          </AdminField>
          <AdminField label="Parent">
            <select name="parentId" className={adminFieldClass} defaultValue="">
              <option value="">None (division)</option>
              {allRows.map((row) => (
                <option key={row.id} value={row.id}>
                  {categoryPath(row)}
                </option>
              ))}
            </select>
          </AdminField>
          <AdminField label="Position">
            <input name="position" defaultValue="0" className={adminFieldClass} />
          </AdminField>
          <AdminField label="Description">
            <textarea name="description" className={adminAreaClass} />
          </AdminField>
          <AdminField label="Category image (Cloudinary public ID or URL)">
            <input name="imagePublicId" className={adminFieldClass} placeholder="papersource/categories/paper" />
          </AdminField>
          <SubmitProgressButton idleLabel="Create category" pendingLabel="Creating category…" className={paperButton({ variant: "secondary" })} />
        </form>
      ) : null}
    </main>
  );
}
