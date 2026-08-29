import { NextResponse } from "next/server";
import { z } from "zod";
import { adjustInventory, InventoryAdminError } from "@/features/inventory/admin";
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
    await adjustInventory({
      role: actor.role,
      actorId: actor.profileId,
      variantId: z.string().uuid().parse(formData.get("variantId")),
      delta: Number(formData.get("delta")),
      reason: String(formData.get("reason") ?? ""),
    });
  } catch (error) {
    const message =
      error instanceof InventoryAdminError || error instanceof Error
        ? error.message
        : "Could not adjust stock.";
    next.searchParams.set("error", message);
  }

  return NextResponse.redirect(next, 303);
}
