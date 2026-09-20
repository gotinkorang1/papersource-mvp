import type { Metadata } from "next";
import Link from "next/link";
import { SubmitProgressButton } from "@/components/admin/submit-progress-button";
import { requireCustomer } from "@/lib/customer/require";
import { listSavedLists } from "@/features/saved-lists/repository";

export const metadata: Metadata = { title: "Saved lists", robots: { index: false, follow: false } };

export default async function AccountSavedListsPage({ searchParams }: { searchParams: Promise<{ message?: string; error?: string }> }) {
  const actor = await requireCustomer("/account/lists");
  const { message, error } = await searchParams;
  const lists = await listSavedLists(actor);

  return (
    <main>
      <h1 className="text-3xl text-ink">Saved lists</h1>
      <p className="mt-3 max-w-2xl text-slate">Save regular stationery purchases for quick replenishment, classroom supplies, or office procurement.</p>
      {message ? <p role="status" className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{message}</p> : null}
      {error ? <p role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{error}</p> : null}
      <section className="mt-8 rounded-xl border border-border bg-surface p-5 shadow-sm" aria-labelledby="create-list-heading">
        <h2 id="create-list-heading" className="font-heading text-xl text-ink">Create a saved list</h2>
        <form action="/account/lists/mutate" method="post" className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_auto] sm:items-end">
          <input type="hidden" name="intent" value="create" />
          <label className="grid gap-1 text-sm font-medium text-ink">List name<input name="name" required minLength={2} maxLength={120} placeholder="Monthly office supplies" className="h-11 rounded-lg border border-border bg-background px-3 font-normal text-ink" /></label>
          <label className="grid gap-1 text-sm font-medium text-ink">Description <span className="font-normal text-slate">(optional)</span><input name="description" maxLength={500} placeholder="Items we reorder every month" className="h-11 rounded-lg border border-border bg-background px-3 font-normal text-ink" /></label>
          <SubmitProgressButton idleLabel="Create list" pendingLabel="Creating…" className="min-h-11 rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-cream hover:bg-ink/90" />
        </form>
      </section>
      <section className="mt-8" aria-labelledby="your-lists-heading">
        <div className="flex items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate">Your catalogue shortcuts</p><h2 id="your-lists-heading" className="mt-1 font-heading text-xl text-ink">Saved lists</h2></div><span className="text-sm text-slate">{lists.length} {lists.length === 1 ? "list" : "lists"}</span></div>
        {lists.length ? <ul className="mt-4 grid gap-3 sm:grid-cols-2">{lists.map((list) => <li key={list.id} className="rounded-xl border border-border bg-surface p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><h3 className="font-heading text-lg text-ink"><Link href={`/account/lists/${list.id}`} className="underline underline-offset-4">{list.name}</Link></h3><p className="mt-1 text-sm text-slate">{list.organizationName ? `${list.organizationName} · ` : "Personal list · "}{list.itemCount} {list.itemCount === 1 ? "item" : "items"}</p></div><form action="/account/lists/mutate" method="post"><input type="hidden" name="intent" value="delete" /><input type="hidden" name="listId" value={list.id} /><SubmitProgressButton idleLabel="Delete" pendingLabel="Deleting…" className="text-sm text-slate underline underline-offset-4 hover:text-red-700" /></form></div>{list.description ? <p className="mt-3 text-sm text-slate">{list.description}</p> : null}<p className="mt-4 text-xs text-slate">Updated {list.updatedAt.toLocaleDateString("en-GH")}</p></li>)}</ul> : <div className="mt-4 rounded-xl border border-dashed border-border p-8 text-center"><p className="font-medium text-ink">No saved lists yet</p><p className="mt-1 text-sm text-slate">Create one above, then save products from the catalogue.</p></div>}
      </section>
    </main>
  );
}
