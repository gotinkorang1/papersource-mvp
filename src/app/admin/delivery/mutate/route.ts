import { NextResponse } from "next/server";
import { createDeliveryZone, deleteDeliveryZone, DeliveryAdminError, updateDeliveryZone } from "@/features/delivery/admin";
import { readStaffActor } from "@/lib/staff/require";

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  const next = new URL("/admin/delivery", origin);
  const actor = await readStaffActor();
  if (!actor) return NextResponse.redirect(new URL("/admin/login", origin), 303);
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");
  try {
    if (intent === "delete-zone") {
      await deleteDeliveryZone({ role: actor.role, zoneId: String(form.get("zoneId") ?? "") });
    } else {
      const input = { role: actor.role, name: String(form.get("name") ?? ""), region: String(form.get("region") ?? ""), code: String(form.get("code") ?? ""), basePrice: String(form.get("basePrice") ?? ""), feeMode: String(form.get("feeMode") ?? ""), freeShippingThreshold: String(form.get("freeShippingThreshold") ?? ""), estimatedMinDays: String(form.get("estimatedMinDays") ?? ""), estimatedMaxDays: String(form.get("estimatedMaxDays") ?? ""), active: String(form.get("active") ?? "false"), sortOrder: String(form.get("sortOrder") ?? "0") };
      if (intent === "create-zone") await createDeliveryZone(input);
      else if (intent === "update-zone") await updateDeliveryZone({ ...input, zoneId: String(form.get("zoneId") ?? "") });
      else throw new DeliveryAdminError("Unknown delivery action.");
    }
  } catch (error) {
    next.searchParams.set("error", error instanceof DeliveryAdminError || error instanceof Error ? error.message : "Could not update delivery zones.");
  }
  return NextResponse.redirect(next, 303);
}
