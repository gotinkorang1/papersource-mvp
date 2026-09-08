import type { Metadata } from "next";
import Link from "next/link";
import { AdminError, AdminField, adminFieldClass } from "@/components/admin/field";
import { SubmitProgressButton } from "@/components/admin/submit-progress-button";
import { paperButton } from "@/components/commerce/paper-button";
import { sellableQuantity, stockLevelFromQuantity } from "@/features/inventory/stock";
import { listInventoryRows } from "@/features/inventory/admin";
import { canAccessAdmin } from "@/lib/staff/rbac";
import { requireStaffArea } from "@/lib/staff/require";

export const metadata: Metadata = {
  title: "Inventory",
};

type PageProps = {
  searchParams: Promise<{ error?: string; q?: string; sort?: string }>;
};

export default async function AdminInventoryPage({ searchParams }: PageProps) {
  const actor = await requireStaffArea("inventory", "read");
  const allRows = await listInventoryRows();
  const canWrite = canAccessAdmin(actor.role, "inventory", "write");
  const { error, q = "", sort = "product" } = await searchParams;
  const query = q.trim().toLocaleLowerCase();
  const filteredRows = query ? allRows.filter((row) => `${row.productName} ${row.sku}`.toLocaleLowerCase().includes(query)) : allRows;
  const rows = [...filteredRows].sort((a, b) => sort === "sellable" ? sellableQuantity(a.onHand, a.reserved) - sellableQuantity(b.onHand, b.reserved) : sort === "sku" ? a.sku.localeCompare(b.sku) : a.productName.localeCompare(b.productName) || a.sku.localeCompare(b.sku));

  return (
    <main>
      <p className="text-sm tracking-[0.16em] text-slate uppercase">Catalogue</p>
      <h1 className="mt-2 font-heading text-3xl text-ink">Inventory</h1>
      <p className="mt-3 max-w-2xl text-slate">
        Adjust on-hand with a reason. Every change writes a movement row.
      </p>
      <AdminError error={error} />
      <form className="mt-6 flex flex-wrap gap-2" method="get"><label className="sr-only" htmlFor="inventory-search">Search inventory</label><input id="inventory-search" name="q" defaultValue={q} className={`${adminFieldClass} min-w-[16rem] flex-1`} placeholder="Search product or SKU" /><select name="sort" defaultValue={sort} className={adminFieldClass}><option value="product">Sort: product</option><option value="sku">Sort: SKU</option><option value="sellable">Sort: sellable stock</option></select><button className={paperButton({ variant: "secondary" })}>Search</button>{q || sort !== "product" ? <Link href="/admin/inventory" className="self-center text-sm text-slate underline">Clear</Link> : null}</form>
      <div className="mt-8 overflow-x-auto rounded-xl border border-border bg-card">
        <table className="admin-responsive-table w-full min-w-[48rem] text-sm">
          <caption className="sr-only">Stock by variant</caption>
          <thead>
            <tr className="border-b border-border text-left text-slate">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">On hand</th>
              <th className="px-4 py-3 font-medium">Reserved</th>
              <th className="px-4 py-3 font-medium">Sellable</th>
              <th className="px-4 py-3 font-medium">Level</th>
              {canWrite ? <th className="px-4 py-3 font-medium">Quick adjust</th> : null}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? <tr><td colSpan={canWrite ? 7 : 6} className="px-4 py-8 text-center text-sm text-slate">{q ? "No inventory rows match this search." : "No inventory rows yet."}</td></tr> : rows.map((row) => {
              const sellable = sellableQuantity(row.onHand, row.reserved);
              return (
                <tr key={row.inventoryId} className="border-b border-border last:border-0">
                  <td className="px-4 py-3" data-label="Product">
                    <Link href={`/admin/products/${row.productId}`} className="underline">
                      {row.productName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs" data-label="SKU">{row.sku}</td>
                  <td className="px-4 py-3 tabular-nums" data-label="On hand">{row.onHand}</td>
                  <td className="px-4 py-3 tabular-nums" data-label="Reserved">{row.reserved}</td>
                  <td className="px-4 py-3 tabular-nums" data-label="Sellable">{sellable}</td>
                  <td className="px-4 py-3" data-label="Level">
                    {stockLevelFromQuantity(sellable, row.lowStockThreshold).replaceAll("_", " ")}
                  </td>
                  {canWrite ? <td className="px-4 py-3"><form action="/admin/inventory/mutate" method="post" className="flex min-w-[17rem] items-center gap-2"><input type="hidden" name="variantId" value={row.variantId} /><label className="sr-only" htmlFor={`delta-${row.variantId}`}>Stock change for {row.sku}</label><input id={`delta-${row.variantId}`} name="delta" required className="h-9 w-20 rounded-md border border-border bg-background px-2 text-sm text-ink" placeholder="+/-" /><label className="sr-only" htmlFor={`reason-${row.variantId}`}>Reason for {row.sku}</label><select id={`reason-${row.variantId}`} name="reason" defaultValue="receive" className="h-9 rounded-md border border-border bg-background px-2 text-xs text-ink"><option value="receive">Receive</option><option value="adjust">Adjust</option></select><SubmitProgressButton idleLabel="Apply" pendingLabel="…" className="h-9 min-h-0 px-2 text-xs" /></form></td> : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {canWrite ? (
        <form
          action="/admin/inventory/mutate"
          method="post"
          className="mt-8 grid max-w-xl gap-3 rounded-xl border border-border bg-card p-5"
        >
          <h2 className="font-heading text-xl text-ink">Adjust stock</h2>
          <AdminField label="SKU">
            <select name="variantId" required className={adminFieldClass}>
              {rows.map((row) => (
                <option key={row.variantId} value={row.variantId}>
                  {row.sku} — {row.productName}
                </option>
              ))}
            </select>
          </AdminField>
          <AdminField label="Change (use a minus to reduce)">
            <input name="delta" required className={adminFieldClass} placeholder="12 or -2" />
          </AdminField>
          <AdminField label="Reason">
            <select name="reason" required className={adminFieldClass} defaultValue="receive">
              <option value="receive">Receive</option>
              <option value="adjust">Adjust</option>
            </select>
          </AdminField>
          <SubmitProgressButton idleLabel="Record movement" pendingLabel="Recording movement…" className={paperButton()} />
        </form>
      ) : (
        <p className="mt-6 text-sm text-slate">This role can view stock but cannot adjust it.</p>
      )}
    </main>
  );
}
