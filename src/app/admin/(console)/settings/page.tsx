import type { Metadata } from "next";
import { AdminError, AdminField, adminFieldClass } from "@/components/admin/field";
import { SubmitProgressButton } from "@/components/admin/submit-progress-button";
import { paperButton } from "@/components/commerce/paper-button";
import { getStoreSettings } from "@/features/settings/admin";
import { canAccessAdmin } from "@/lib/staff/rbac";
import { requireStaffArea } from "@/lib/staff/require";

export const metadata: Metadata = { title: "Settings" };

export default async function AdminSettingsPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const actor = await requireStaffArea("settings", "read");
  const settings = await getStoreSettings();
  const { error } = await searchParams;
  const canWrite = canAccessAdmin(actor.role, "settings", "write");

  return (
    <main className="max-w-3xl">
      <p className="text-sm tracking-[0.16em] text-slate uppercase">System</p>
      <h1 className="mt-2 font-heading text-3xl text-ink">Store settings</h1>
      <p className="mt-3 text-slate">These values affect server-computed tax, quotation expiry and support links. Money remains VAT-inclusive integer pesewas.</p>
      <AdminError error={error} />
      <form action="/admin/settings/mutate" method="post" className="mt-8 grid gap-4 rounded-xl border border-border bg-card p-5 sm:grid-cols-2">
        <input type="hidden" name="intent" value="save-settings" />
        <AdminField label="VAT rate (basis points)">
          <input name="vatRateBps" inputMode="numeric" required defaultValue={settings.vatRateBps} className={adminFieldClass} disabled={!canWrite} />
          <span className="mt-1 block text-xs text-slate">Example: 1500 means 15%. Prices remain VAT-inclusive.</span>
        </AdminField>
        <AdminField label="Default quote expiry (days)">
          <input name="quoteExpiryDays" inputMode="numeric" required defaultValue={settings.quoteExpiryDays} className={adminFieldClass} disabled={!canWrite} />
          <span className="mt-1 block text-xs text-slate">Customers receive a reminder 48 hours before expiry.</span>
        </AdminField>
        <AdminField label="WhatsApp business number">
          <input name="whatsappBusinessNumber" placeholder="+233201234567" defaultValue={settings.whatsappBusinessNumber ?? ""} className={adminFieldClass} disabled={!canWrite} />
        </AdminField>
        <AdminField label="Public site URL">
          <input name="siteUrl" type="url" required defaultValue={settings.siteUrl} className={adminFieldClass} disabled={!canWrite} />
        </AdminField>
        <AdminField label="Payment gateway">
          <label className="flex min-h-11 items-center gap-3 rounded-lg border border-border bg-background px-3 text-sm text-ink">
            <input name="paymentsEnabled" type="checkbox" value="true" defaultChecked={settings.paymentsEnabled} disabled={!canWrite} className="size-4 accent-primary" />
            Enable Paystack checkout
          </label>
        </AdminField>
        <AdminField label="Payment mode">
          <select name="paymentMode" defaultValue={settings.paymentMode} disabled={!canWrite} className={adminFieldClass}>
            <option value="test">Test mode</option>
            <option value="live">Live mode</option>
          </select>
          <span className="mt-1 block text-xs text-slate">Live mode requires the server-side PAYSTACK_SECRET_KEY.</span>
        </AdminField>
        {canWrite ? <SubmitProgressButton idleLabel="Save settings" pendingLabel="Saving settings…" className={`${paperButton()} sm:col-span-2 sm:justify-self-start`} /> : null}
      </form>
      <p className="mt-4 text-xs text-slate">Last updated {settings.updatedAt ? new Date(settings.updatedAt).toLocaleString("en-GH") : "by the deployment defaults"}.</p>
    </main>
  );
}
