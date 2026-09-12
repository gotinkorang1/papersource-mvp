import { NextResponse } from "next/server";
import { z } from "zod";
import { recordAdminAudit } from "@/features/admin/audit";
import { adjustInventory, bulkAdjustInventory, InventoryAdminError } from "@/features/inventory/admin";
import { canAccessAdmin } from "@/lib/staff/rbac";
import { readStaffActor } from "@/lib/staff/require";

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  const next = new URL("/admin/inventory", origin);
  const actor = await readStaffActor();
  if (!actor) {
    return NextResponse.redirect(new URL("/admin/login", origin), 303);
  }
  if (!canAccessAdmin(actor.role, "inventory", "write")) {
    next.searchParams.set("error", "This role cannot change stock.");
    return NextResponse.redirect(next, 303);
  }

  try {
    const formData = await request.formData();
    const intent = String(formData.get("intent") ?? "adjust");
    if (intent === "bulk-adjust") {
      const variantIds = formData.getAll("variantId").map((value) => z.string().uuid().parse(value));
      const operation = String(formData.get("operation") ?? "");
      const quantity = String(formData.get("quantity") ?? "");
      const reason = String(formData.get("reason") ?? "");
      const count = await bulkAdjustInventory({ role: actor.role, actorId: actor.profileId, variantIds, quantity, operation, reason });
      await recordAdminAudit({
        actorProfileId: actor.profileId,
        action: "inventory_bulk_adjusted",
        resourceType: "inventory",
        resourceId: null,
        metadata: { count, operation, quantity: Number(quantity), reason },
      });
    } else {
      const variantId = z.string().uuid().parse(formData.get("variantId"));
      const delta = Number(formData.get("delta"));
      const reason = String(formData.get("reason") ?? "");
      await adjustInventory({ role: actor.role, actorId: actor.profileId, variantId, delta, reason });
      await recordAdminAudit({ actorProfileId: actor.profileId, action: "inventory_adjusted", resourceType: "variant", resourceId: variantId, metadata: { delta, reason } });
    }
  } catch (error) {
    const message = error instanceof InventoryAdminError
      ? error.message
      : "Could not adjust stock. Please check the fields and try again.";
    next.searchParams.set("error", message);
  }

  return NextResponse.redirect(next, 303);
}
