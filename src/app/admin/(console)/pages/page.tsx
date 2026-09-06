import type { Metadata } from "next";
import Link from "next/link";
import { AdminError, AdminField, adminAreaClass, adminFieldClass } from "@/components/admin/field";
import { paperButton } from "@/components/commerce/paper-button";
import { listAdminPages } from "@/features/content/admin";
import { canAccessAdmin } from "@/lib/staff/rbac";
import { requireStaffArea } from "@/lib/staff/require";

export const metadata: Metadata = { title: "Pages" };

export default async function AdminPagesPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const actor = await requireStaffArea("pages", "read");
  const rows = await listAdminPages(actor.role);
  const canWrite = canAccessAdmin(actor.role, "pages", "write");
  const { error } = await searchParams;

  const form = (row?: (typeof rows)[number]) => (
    <form action="/admin/pages/mutate" method="post" className="grid gap-4 rounded-xl border border-border bg-card p-5 shadow-sm sm:grid-cols-2">
      <input type="hidden" name="id" value={row?.id ?? ""} />
      <AdminField label="Slug"><input name="slug" required defaultValue={row?.slug} placeholder="our-story" className={adminFieldClass} /></AdminField>
      <AdminField label="Title"><input name="title" required defaultValue={row?.title} className={adminFieldClass} /></AdminField>
      <AdminField label="Description"><input name="description" required defaultValue={row?.description} className={adminFieldClass} /></AdminField>
      <AdminField label="Status"><select name="status" defaultValue={row?.status ?? "draft"} className={adminFieldClass}><option value="draft">Draft</option><option value="published">Published</option></select></AdminField>
      <AdminField label="Body"><textarea name="body" required defaultValue={row?.body} rows={8} className={`${adminAreaClass} sm:col-span-2`} /></AdminField>
      {canWrite ? <div className="flex flex-wrap items-center gap-3 sm:col-span-2"><button className={paperButton()} type="submit">{row ? "Save page" : "Create page"}</button>{row?.status === "published" ? <Link href={`/pages/${row.slug}`} target="_blank" className="text-sm font-medium text-ink underline underline-offset-4">Preview public page</Link> : <span className="text-xs text-slate">Publish to make this page visible.</span>}</div> : null}
    </form>
  );

  return <main><p className="text-sm uppercase tracking-[0.16em] text-slate">Website</p><h1 className="mt-2 font-heading text-3xl text-ink">Pages</h1><p className="mt-3 max-w-2xl text-slate">Manage published information pages and keep drafts private.</p><AdminError error={error} /><div className="mt-8 space-y-6">{rows.map((row) => <section key={row.id}><div className="mb-2 flex items-center justify-between text-sm"><span className="font-medium text-ink">/{row.slug}</span><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${row.status === "published" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200" : "bg-cream text-slate"}`}>{row.status}</span></div>{form(row)}</section>)}{canWrite ? <section><h2 className="mb-2 font-heading text-xl text-ink">New page</h2>{form()}</section> : null}{!rows.length && !canWrite ? <p className="rounded-xl border border-dashed border-border p-6 text-sm text-slate">No pages have been created yet.</p> : null}</div></main>;
}
