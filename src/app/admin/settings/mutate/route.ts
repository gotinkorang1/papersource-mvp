import { NextResponse } from "next/server";
import { SettingsAdminError, saveStoreSettings } from "@/features/settings/admin";
import { readStaffActor } from "@/lib/staff/require";

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  const next = new URL("/admin/settings", origin);
  const actor = await readStaffActor();
  if (!actor) return NextResponse.redirect(new URL("/admin/login", origin), 303);
  const form = await request.formData();
  try {
    await saveStoreSettings({ role: actor.role, actorId: actor.profileId, vatRateBps: String(form.get("vatRateBps") ?? ""), quoteExpiryDays: String(form.get("quoteExpiryDays") ?? ""), whatsappBusinessNumber: String(form.get("whatsappBusinessNumber") ?? ""), siteUrl: String(form.get("siteUrl") ?? "") });
  } catch (error) {
    next.searchParams.set("error", error instanceof SettingsAdminError || error instanceof Error ? error.message : "Could not save settings.");
  }
  return NextResponse.redirect(next, 303);
}
