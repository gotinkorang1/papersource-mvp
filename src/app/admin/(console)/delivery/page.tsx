import type { Metadata } from "next";
import { AdminError, AdminField, adminFieldClass } from "@/components/admin/field";
import { SubmitProgressButton } from "@/components/admin/submit-progress-button";
import { paperButton } from "@/components/commerce/paper-button";
import { listAdminDeliveryZones } from "@/features/delivery/admin";
import { formatGhs, pesewasToMajor } from "@/lib/money";
import { canAccessAdmin } from "@/lib/staff/rbac";
import { requireStaffArea } from "@/lib/staff/require";

export const metadata: Metadata = { title: "Delivery zones" };

function ZoneFields({ zone, disabled = false }: { zone?: Awaited<ReturnType<typeof listAdminDeliveryZones>>[number]; disabled?: boolean }) {
  return <>
    <AdminField label="Name"><input name="name" required defaultValue={zone?.name} className={adminFieldClass} disabled={disabled} /></AdminField>
    <AdminField label="Region"><input name="region" required defaultValue={zone?.region} className={adminFieldClass} disabled={disabled} /></AdminField>
    <AdminField label="Code"><input name="code" required defaultValue={zone?.code} className={adminFieldClass} disabled={disabled} /></AdminField>
    <AdminField label="Fee mode"><select name="feeMode" defaultValue={zone?.feeMode ?? "calculated"} className={adminFieldClass} disabled={disabled}><option value="calculated">Calculated</option><option value="on_request">On request</option></select></AdminField>
    <AdminField label="Base fee (GHS)"><input name="basePrice" inputMode="decimal" defaultValue={zone ? pesewasToMajor(zone.basePrice) : "0"} className={adminFieldClass} disabled={disabled} /></AdminField>
    <AdminField label="Free shipping threshold (GHS)"><input name="freeShippingThreshold" inputMode="decimal" defaultValue={zone?.freeShippingThreshold == null ? "" : pesewasToMajor(zone.freeShippingThreshold)} className={adminFieldClass} disabled={disabled} /></AdminField>
    <AdminField label="Minimum days"><input name="estimatedMinDays" inputMode="numeric" required defaultValue={zone?.estimatedMinDays ?? 1} className={adminFieldClass} disabled={disabled} /></AdminField>
    <AdminField label="Maximum days"><input name="estimatedMaxDays" inputMode="numeric" required defaultValue={zone?.estimatedMaxDays ?? 2} className={adminFieldClass} disabled={disabled} /></AdminField>
    <AdminField label="Sort order"><input name="sortOrder" inputMode="numeric" defaultValue={zone?.sortOrder ?? 0} className={adminFieldClass} disabled={disabled} /></AdminField>
    <AdminField label="Active"><select name="active" defaultValue={zone?.active === false ? "false" : "true"} className={adminFieldClass} disabled={disabled}><option value="true">Yes</option><option value="false">No</option></select></AdminField>
  </>;
}

export default async function AdminDeliveryPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const actor = await requireStaffArea("delivery_zones", "read");
  const zones = await listAdminDeliveryZones();
  const { error } = await searchParams;
  const canWrite = canAccessAdmin(actor.role, "delivery_zones", "write");
  return <main>
    <p className="text-sm tracking-[0.16em] text-slate uppercase">System</p>
    <h1 className="mt-2 font-heading text-3xl text-ink">Delivery zones</h1>
    <p className="mt-3 max-w-2xl text-slate">Control the active Ghana delivery areas, fees and lead-time copy shown at checkout. Use on-request for locations whose fee is agreed by the desk.</p>
    <AdminError error={error} />
    <div className="mt-8 space-y-6">
      {zones.map((zone) => <section key={zone.id} className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-3"><h2 className="font-heading text-xl text-ink">{zone.name}</h2><p className="text-sm text-slate">{zone.active ? "Active" : "Inactive"} · {zone.feeMode === "on_request" ? "Fee on request" : formatGhs(zone.basePrice)}</p></div>
        <p className="mt-1 text-sm text-slate">{zone.region} · <span className="font-mono">{zone.code}</span> · {zone.estimatedMinDays}–{zone.estimatedMaxDays} days</p>
        {canWrite ? <>
          <form action="/admin/delivery/mutate" method="post" className="mt-4 grid gap-3 sm:grid-cols-2">
            <input type="hidden" name="intent" value="update-zone" />
            <input type="hidden" name="zoneId" value={zone.id} />
            <ZoneFields zone={zone} />
            <div className="flex flex-wrap gap-3 sm:col-span-2">
              <SubmitProgressButton idleLabel="Save zone" pendingLabel="Saving zone…" className={paperButton()} />
            </div>
          </form>
          <form action="/admin/delivery/mutate" method="post" className="mt-2">
            <input type="hidden" name="intent" value="delete-zone" />
            <input type="hidden" name="zoneId" value={zone.id} />
            <button type="submit" className={paperButton({ variant: "ghost" })}>Delete zone</button>
          </form>
        </> : null}
      </section>)}
    </div>
    {canWrite ? <form action="/admin/delivery/mutate" method="post" className="mt-8 grid max-w-3xl gap-3 rounded-xl border border-border bg-card p-5 sm:grid-cols-2"><h2 className="font-heading text-xl text-ink sm:col-span-2">New zone</h2><input type="hidden" name="intent" value="create-zone" /><ZoneFields /><SubmitProgressButton idleLabel="Create zone" pendingLabel="Creating zone…" className={`${paperButton({ variant: "secondary" })} sm:col-span-2 sm:justify-self-start`} /></form> : null}
  </main>;
}
