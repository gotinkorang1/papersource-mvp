import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCustomer } from "@/lib/customer/require";
import { getSavedList, SavedListError } from "@/features/saved-lists/repository";

export const metadata: Metadata = { title: "Saved list", robots: { index: false, follow: false } };

export default async function SavedListDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams?: Promise<{ message?: string; error?: string }> }) {
  const { id } = await params;
  const actor = await requireCustomer(`/account/lists/${id}`);
  const { message, error } = (await searchParams) ?? {};
  let list;
  try {
    list = await getSavedList(actor, id);
  } catch (error) {
    if (error instanceof SavedListError && /not found/i.test(error.message)) notFound();
    throw error;
  }

  return (
    <main>
      <Link href="/account/lists" className="text-sm font-medium text-slate underline underline-offset-4 hover:text-ink">
        ← Back to saved lists
      </Link>
      <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate">Saved list</p>
          <h1 className="mt-1 text-3xl text-ink">{list.name}</h1>
          {list.description ? <p className="mt-3 max-w-2xl text-slate">{list.description}</p> : null}
        </div>
        <Link href="/products" className="min-h-11 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-ink hover:bg-muted">
          Browse products
        </Link>
      </div>
      {message ? <p role="status" className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{message}</p> : null}
      {error ? <p role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{error}</p> : null}

      <section className="mt-8" aria-labelledby="saved-list-items-heading">
        <div className="flex items-end justify-between gap-3">
          <h2 id="saved-list-items-heading" className="font-heading text-xl text-ink">Items in this list</h2>
          <span className="text-sm text-slate">{list.items.length} {list.items.length === 1 ? "item" : "items"}</span>
        </div>
        {list.items.some((item) => item.productActive && item.variantActive) ? (
          <div className="mt-4 flex flex-wrap gap-2 rounded-xl border border-border bg-cream/50 p-3">
            <form action="/account/lists/items/mutate" method="post">
              <input type="hidden" name="intent" value="bulk-cart" />
              <input type="hidden" name="listId" value={list.id} />
              <button type="submit" className="min-h-10 rounded-lg bg-ink px-3 py-2 text-sm font-semibold text-cream hover:bg-ink/90">Add available to Cart</button>
            </form>
            <form action="/account/lists/items/mutate" method="post">
              <input type="hidden" name="intent" value="bulk-quote" />
              <input type="hidden" name="listId" value={list.id} />
              <button type="submit" className="min-h-10 rounded-lg border border-paper-green px-3 py-2 text-sm font-semibold text-paper-green hover:bg-paper-green hover:text-white">Add available to Quote</button>
            </form>
            <p className="basis-full text-xs text-slate">Unavailable items are skipped and remain visible below for cleanup.</p>
          </div>
        ) : null}

        {list.items.length ? (
          <ul className="mt-4 grid gap-3">
            {list.items.map((item) => {
              const available = item.productActive && item.variantActive;
              return (
                <li key={item.id} className="rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      {available ? (
                        <Link href={`/products/${item.productSlug}`} className="font-heading text-lg text-ink underline underline-offset-4">
                          {item.productName}
                        </Link>
                      ) : (
                        <p className="font-heading text-lg text-ink">{item.productName}</p>
                      )}
                      <p className="mt-1 text-sm text-slate">SKU: {item.sku} · Quantity: {item.quantity}</p>
                      {item.note ? <p className="mt-2 text-sm text-slate">{item.note}</p> : null}
                      {!available ? <p className="mt-2 text-sm font-semibold text-red-700">Unavailable — remove or replace this item before reordering.</p> : null}
                    </div>
                    <form action="/account/lists/items/mutate" method="post">
                      <input type="hidden" name="intent" value="remove" />
                      <input type="hidden" name="listId" value={list.id} />
                      <input type="hidden" name="itemId" value={item.id} />
                      <button type="submit" className="min-h-10 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-slate hover:border-red-300 hover:text-red-700">Remove</button>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-border p-8 text-center">
            <p className="font-medium text-ink">This list is empty</p>
            <p className="mt-1 text-sm text-slate">Browse the catalogue and save products here for your next order.</p>
          </div>
        )}
      </section>
    </main>
  );
}
