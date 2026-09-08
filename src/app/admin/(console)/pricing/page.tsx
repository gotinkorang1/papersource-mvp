import type { Metadata } from "next";
import Link from "next/link";
import { AdminError, AdminField, adminFieldClass } from "@/components/admin/field";
import { SubmitProgressButton } from "@/components/admin/submit-progress-button";
import { paperButton } from "@/components/commerce/paper-button";
import { listAdminPricingRows } from "@/features/catalogue/admin";
import { formatGhs } from "@/lib/money";
import { canAccessAdmin } from "@/lib/staff/rbac";
import { requireStaffArea } from "@/lib/staff/require";

export const metadata: Metadata = {
  title: "Pricing",
};

type PageProps = {
  searchParams: Promise<{ error?: string; q?: string; sort?: string }>;
};

export default async function AdminPricingPage({ searchParams }: PageProps) {
  const actor = await requireStaffArea("pricing", "read");
  const allRows = await listAdminPricingRows();
  const canWrite = canAccessAdmin(actor.role, "pricing", "write");
  const { error, q = "", sort = "product" } = await searchParams;
  const query = q.trim().toLocaleLowerCase();
  const filteredRows = query ? allRows.filter((row) => `${row.productName} ${row.sku}`.toLocaleLowerCase().includes(query)) : allRows;
  const rows = [...filteredRows].sort((a, b) => sort === "sku" ? a.sku.localeCompare(b.sku) : a.productName.localeCompare(b.productName) || a.sku.localeCompare(b.sku));

  return (
    <main>
      <p className="text-sm tracking-[0.16em] text-slate uppercase">Catalogue</p>
      <h1 className="mt-2 font-heading text-3xl text-ink">Pricing</h1>
      <p className="mt-3 max-w-2xl text-slate">
        Tiers are per variant, in integer pesewas. Request-quote is for volume the desk must price.
      </p>
      <AdminError error={error} />
      <form className="mt-6 flex flex-wrap gap-2" method="get"><label className="sr-only" htmlFor="pricing-search">Search pricing</label><input id="pricing-search" name="q" defaultValue={q} className={`${adminFieldClass} min-w-[16rem] flex-1`} placeholder="Search product or SKU" /><select name="sort" defaultValue={sort} className={adminFieldClass}><option value="product">Sort: product</option><option value="sku">Sort: SKU</option></select><button className={paperButton({ variant: "secondary" })}>Search</button>{q || sort !== "product" ? <Link href="/admin/pricing" className="self-center text-sm text-slate underline">Clear</Link> : null}</form>
      <div className="mt-8 space-y-6">
        {rows.length === 0 ? <div className="rounded-xl border border-dashed border-border bg-card px-5 py-10 text-center text-sm text-slate">{q ? "No pricing rows match this search." : "No pricing rows yet."}</div> : rows.map((row) => (
          <section key={row.variantId} className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-heading text-lg text-ink">
              <Link href={`/admin/products/${row.productId}`} className="underline">
                {row.productName}
              </Link>
              <span className="ml-2 font-mono text-sm font-normal text-slate">{row.sku}</span>
            </h2>
            <p className="mt-1 text-sm text-slate">
              Base {formatGhs(row.baseUnitPrice)} / {row.unitLabel}
              {row.variantActive ? "" : " · inactive variant"}
              {row.status === "active" ? "" : ` · product ${row.status}`}
            </p>
            <ul className="mt-3 space-y-1 text-sm">
              {row.tiers.length === 0 ? (
                <li className="text-slate">No extra bands. Shop uses the base unit price.</li>
              ) : (
                row.tiers.map((tier) => (
                  <li key={tier.id} className="flex flex-wrap items-center justify-between gap-3">
                    <span>
                      Qty {tier.minimumQuantity}
                      {tier.maximumQuantity ? `–${tier.maximumQuantity}` : "+"}:{" "}
                      {tier.requestQuote
                        ? "request quote"
                        : tier.unitPrice !== null
                          ? formatGhs(tier.unitPrice)
                          : "—"}
                      {tier.active ? "" : " (inactive)"}
                    </span>
                    {canWrite && tier.active ? (
                      <div className="flex flex-wrap items-center justify-end gap-2"><form action="/admin/pricing/mutate" method="post" className="flex items-center gap-2"><input type="hidden" name="intent" value="save-tier" /><input type="hidden" name="tierId" value={tier.id} /><label className="sr-only" htmlFor={`tier-min-${tier.id}`}>Minimum quantity</label><input id={`tier-min-${tier.id}`} name="minimumQuantity" defaultValue={tier.minimumQuantity} className="h-8 w-16 rounded border border-border bg-background px-2 text-xs text-ink" /><span className="text-xs text-slate">to</span><label className="sr-only" htmlFor={`tier-max-${tier.id}`}>Maximum quantity</label><input id={`tier-max-${tier.id}`} name="maximumQuantity" defaultValue={tier.maximumQuantity ?? ""} placeholder="+" className="h-8 w-16 rounded border border-border bg-background px-2 text-xs text-ink" /><label className="sr-only" htmlFor={`tier-price-${tier.id}`}>Unit price</label><input id={`tier-price-${tier.id}`} name="unitPrice" defaultValue={tier.unitPrice === null ? "" : (tier.unitPrice / 100).toFixed(2)} placeholder="GHS" className="h-8 w-20 rounded border border-border bg-background px-2 text-xs text-ink" /><label className="flex items-center gap-1 text-xs text-slate"><input type="checkbox" name="requestQuote" value="true" defaultChecked={tier.requestQuote} />Quote</label><SubmitProgressButton idleLabel="Save" pendingLabel="…" className="h-8 min-h-0 px-2 text-xs" /></form><form action="/admin/pricing/mutate" method="post"><input type="hidden" name="intent" value="deactivate-tier" /><input type="hidden" name="tierId" value={tier.id} /><SubmitProgressButton idleLabel="Deactivate" pendingLabel="…" className="h-8 min-h-0 px-2 text-xs underline" /></form></div>
                    ) : null}
                  </li>
                ))
              )}
            </ul>
            {canWrite ? (
              <form
                action="/admin/pricing/mutate"
                method="post"
                className="mt-4 grid gap-3 sm:grid-cols-2"
              >
                <input type="hidden" name="intent" value="add-tier" />
                <input type="hidden" name="variantId" value={row.variantId} />
                <AdminField label="Minimum qty">
                  <input name="minimumQuantity" required defaultValue="1" className={adminFieldClass} />
                </AdminField>
                <AdminField label="Maximum qty">
                  <input name="maximumQuantity" className={adminFieldClass} />
                </AdminField>
                <AdminField label="Unit price (GHS)">
                  <input name="unitPrice" className={adminFieldClass} />
                </AdminField>
                <label className="flex items-center gap-2 self-end text-sm text-ink">
                  <input type="checkbox" name="requestQuote" value="true" />
                  Request quote
                </label>
                <div className="sm:col-span-2">
                  <SubmitProgressButton idleLabel={`Add band for ${row.sku}`} pendingLabel="Adding band…" className={paperButton({ variant: "secondary" })} />
                </div>
              </form>
            ) : null}
          </section>
        ))}
      </div>
    </main>
  );
}
