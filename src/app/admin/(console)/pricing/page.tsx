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
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminPricingPage({ searchParams }: PageProps) {
  const actor = await requireStaffArea("pricing", "read");
  const rows = await listAdminPricingRows();
  const canWrite = canAccessAdmin(actor.role, "pricing", "write");
  const { error } = await searchParams;

  return (
    <main>
      <p className="text-sm tracking-[0.16em] text-slate uppercase">Catalogue</p>
      <h1 className="mt-2 font-heading text-3xl text-ink">Pricing</h1>
      <p className="mt-3 max-w-2xl text-slate">
        Tiers are per variant, in integer pesewas. Request-quote is for volume the desk must price.
      </p>
      <AdminError error={error} />
      <div className="mt-8 space-y-6">
        {rows.map((row) => (
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
                      <form action="/admin/pricing/mutate" method="post">
                        <input type="hidden" name="intent" value="deactivate-tier" />
                        <input type="hidden" name="tierId" value={tier.id} />
                        <SubmitProgressButton idleLabel="Deactivate" pendingLabel="Deactivating…" className="underline" />
                      </form>
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
