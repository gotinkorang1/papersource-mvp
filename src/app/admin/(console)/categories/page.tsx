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
  searchParams: Promise<{ error?: string; q?: string; message?: string }>;
};

export default async function AdminCategoriesPage({ searchParams }: PageProps) {
  const actor = await requireStaffArea("categories", "read");
  const allRows = await listAdminCategories();
  const canWrite = canAccessAdmin(actor.role, "categories", "write");
  const { error, q = "", message } = await searchParams;
  const query = q.trim().toLocaleLowerCase();
  const rows = query ? allRows.filter((row) => `${row.name} ${row.slug}`.toLocaleLowerCase().includes(query)) : allRows;
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
      <form className="mt-6 flex flex-wrap gap-2" method="get"><label className="sr-only" htmlFor="category-search">Search categories</label><input id="category-search" name="q" defaultValue={q} className={`${adminFieldClass} min-w-[16rem] flex-1`} placeholder="Search categories or slugs" /><button className={paperButton({ variant: "secondary" })}>Search</button>{q ? <Link href="/admin/categories" className="self-center text-sm text-slate underline">Clear</Link> : null}</form>
      {canWrite ? <form id="bulk-categories" action="/admin/categories/mutate" method="post" className="mt-6 flex flex-wrap items-center gap-3 rounded-t-xl border border-border bg-muted/30 p-3"><input type="hidden" name="intent" value="bulk-active" /><SelectAllCheckbox count={rows.length} name="categoryId" label="categories" /><select name="active" defaultValue="true" className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-ink"><option value="true">Set active</option><option value="false">Set inactive</option></select><button className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">Apply to selected</button><span className="text-xs text-slate">Bulk updates only change visibility.</span></form> : null}
      <div className={`overflow-x-auto rounded-b-xl border border-border bg-card ${canWrite ? "border-t-0" : "mt-8 rounded-xl"}`}>
        <table className="w-full min-w-[42rem] text-sm">
          <caption className="sr-only">Categories</caption>
          <thead>
            <tr className="border-b border-border text-left text-slate">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Active</th>
              {canWrite ? <th className="px-4 py-3 font-medium">Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? <tr><td colSpan={canWrite ? 4 : 3} className="px-4 py-8 text-center text-sm text-slate">{q ? "No categories match this search." : "No categories yet."}</td></tr> : rows.map((row) => (
              <tr key={row.id} className="border-b border-border last:border-0 align-top">
                <td className="px-4 py-3">{canWrite ? <input form="bulk-categories" type="checkbox" name="categoryId" value={row.id} aria-label={`Select ${row.name}`} className="mr-3 size-4 align-middle accent-primary" /> : null}<span title={categoryPath(row)}>{categoryPath(row)}</span></td>
                <td className="px-4 py-3 font-mono text-xs">{row.slug}</td>
                <td className="px-4 py-3">{row.active ? "Yes" : "No"}</td>
                {canWrite ? <td className="px-4 py-3"><a href={`#category-${row.id}`} className="font-semibold text-paper-green underline">Edit</a></td> : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {canWrite
        ? rows.map((row) => (
            <form
              key={row.id}
              id={`category-${row.id}`}
              action="/admin/categories/mutate"
              method="post"
              className="mt-4 grid gap-3 rounded-xl border border-border bg-card p-5 sm:grid-cols-2"
            >
              <input type="hidden" name="intent" value="save-category" />
              <input type="hidden" name="categoryId" value={row.id} />
              <AdminField label="Name">
                <input name="name" required defaultValue={row.name} className={adminFieldClass} />
              </AdminField>
              <AdminField label="Slug">
                <input name="slug" required defaultValue={row.slug} className={adminFieldClass} />
              </AdminField>
              <AdminField label="Parent">
                <select name="parentId" defaultValue={row.parentId ?? ""} className={adminFieldClass}>
                  <option value="">None (division)</option>
                  {allRows
                    .filter((candidate) => candidate.id !== row.id)
                    .map((candidate) => (
                      <option key={candidate.id} value={candidate.id}>
                        {categoryPath(candidate)}
                      </option>
                    ))}
                </select>
              </AdminField>
              <AdminField label="Position">
                <input
                  name="position"
                  defaultValue={String(row.position)}
                  className={adminFieldClass}
                />
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
              <AdminField label="Description">
                <textarea
                  name="description"
                  defaultValue={row.description ?? ""}
                  className={adminAreaClass}
                />
              </AdminField>
              <div className="sm:col-span-2">
                <SubmitProgressButton idleLabel={`Save ${row.name}`} pendingLabel="Saving category…" className={paperButton()} />
              </div>
            </form>
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
          <SubmitProgressButton idleLabel="Create category" pendingLabel="Creating category…" className={paperButton({ variant: "secondary" })} />
        </form>
      ) : null}
    </main>
  );
}
