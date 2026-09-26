import { NextResponse } from "next/server";
import { recordAdminAudit } from "@/features/admin/audit";
import { SettingsAdminError, saveStoreSettings } from "@/features/settings/admin";
import { readStaffActor } from "@/lib/staff/require";

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  const next = new URL("/admin/settings", origin);
  const actor = await readStaffActor();
  if (!actor) return NextResponse.redirect(new URL("/admin/login", origin), 303);
  try {
    const form = await request.formData();
    await saveStoreSettings({ role: actor.role, actorId: actor.profileId, vatRateBps: String(form.get("vatRateBps") ?? ""), quoteExpiryDays: String(form.get("quoteExpiryDays") ?? ""), whatsappBusinessNumber: String(form.get("whatsappBusinessNumber") ?? ""), siteUrl: String(form.get("siteUrl") ?? ""), paymentsEnabled: String(form.get("paymentsEnabled") ?? "false"), paymentMode: String(form.get("paymentMode") ?? "test") });
    await recordAdminAudit({
      actorProfileId: actor.profileId,
      action: "settings_updated",
      resourceType: "store_settings",
      resourceId: "store",
      metadata: { fields: ["vatRateBps", "quoteExpiryDays", "whatsappBusinessNumber", "siteUrl", "paymentsEnabled", "paymentMode"] },
    });
  } catch (error) {
    next.searchParams.set("error", error instanceof SettingsAdminError ? error.message : "Could not save settings. Please check the fields and try again.");
  }
  return NextResponse.redirect(next, 303);
}
