import { NextResponse } from "next/server";
import { recordAdminAudit } from "@/features/admin/audit";
import { createDeliveryZone, deleteDeliveryZone, DeliveryAdminError, updateDeliveryZone } from "@/features/delivery/admin";
import { readStaffActor } from "@/lib/staff/require";

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  const next = new URL("/admin/delivery", origin);
  const actor = await readStaffActor();
  if (!actor) return NextResponse.redirect(new URL("/admin/login", origin), 303);
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");
  let auditAction: string;
  let auditResourceId: string | null = null;
  let auditMetadata: Record<string, unknown> | undefined;
  try {
    if (intent === "delete-zone") {
      auditResourceId = String(form.get("zoneId") ?? "");
      await deleteDeliveryZone({ role: actor.role, zoneId: auditResourceId });
      auditAction = "delivery_zone_deleted";
    } else {
      const input = { role: actor.role, name: String(form.get("name") ?? ""), region: String(form.get("region") ?? ""), code: String(form.get("code") ?? ""), basePrice: String(form.get("basePrice") ?? ""), feeMode: String(form.get("feeMode") ?? ""), freeShippingThreshold: String(form.get("freeShippingThreshold") ?? ""), estimatedMinDays: String(form.get("estimatedMinDays") ?? ""), estimatedMaxDays: String(form.get("estimatedMaxDays") ?? ""), active: String(form.get("active") ?? "false"), sortOrder: String(form.get("sortOrder") ?? "0") };
      if (intent === "create-zone") {
        const created = await createDeliveryZone(input);
        auditAction = "delivery_zone_created";
        auditResourceId = created.id;
      } else if (intent === "update-zone") {
        auditResourceId = String(form.get("zoneId") ?? "");
        await updateDeliveryZone({ ...input, zoneId: auditResourceId });
        auditAction = "delivery_zone_updated";
      }
      else throw new DeliveryAdminError("Unknown delivery action.");
      auditMetadata = { fields: ["name", "region", "code", "pricing", "timing", "active"] };
    }
    await recordAdminAudit({ actorProfileId: actor.profileId, action: auditAction!, resourceType: "delivery_zone", resourceId: auditResourceId, metadata: auditMetadata });
  } catch (error) {
    next.searchParams.set("error", error instanceof DeliveryAdminError ? error.message : "Could not update delivery zones. Please check the fields and try again.");
  }
  return NextResponse.redirect(next, 303);
}
