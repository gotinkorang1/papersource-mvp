import type { Metadata } from "next";
import { AdminError, AdminField, adminAreaClass, adminFieldClass } from "@/components/admin/field";
import { SubmitProgressButton } from "@/components/admin/submit-progress-button";
import { paperButton } from "@/components/commerce/paper-button";
import { listAdminCategories } from "@/features/catalogue/admin";
import { canAccessAdmin } from "@/lib/staff/rbac";
import { requireStaffArea } from "@/lib/staff/require";

export const metadata: Metadata = {
  title: "Categories",
};

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminCategoriesPage({ searchParams }: PageProps) {
  const actor = await requireStaffArea("categories", "read");
  const rows = await listAdminCategories();
  const canWrite = canAccessAdmin(actor.role, "categories", "write");
  const { error } = await searchParams;

  return (
    <main>
      <p className="text-sm tracking-[0.16em] text-slate uppercase">Catalogue</p>
      <h1 className="mt-2 font-heading text-3xl text-ink">Categories</h1>
      <p className="mt-3 max-w-2xl text-slate">
        Shop routes follow these slugs. Keep names operational, not decorative.
      </p>
      <AdminError error={error} />
      <div className="mt-8 overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <caption className="sr-only">Categories</caption>
          <thead>
            <tr className="border-b border-border text-left text-slate">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Active</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-border last:border-0 align-top">
                <td className="px-4 py-3">{row.name}</td>
                <td className="px-4 py-3 font-mono text-xs">{row.slug}</td>
                <td className="px-4 py-3">{row.active ? "Yes" : "No"}</td>
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
                  {rows
                    .filter((candidate) => candidate.id !== row.id)
                    .map((candidate) => (
                      <option key={candidate.id} value={candidate.id}>
                        {candidate.name}
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
              {rows.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.name}
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
