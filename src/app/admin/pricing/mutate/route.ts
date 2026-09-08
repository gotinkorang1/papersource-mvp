import { NextResponse } from "next/server";
import { z } from "zod";
import { recordAdminAudit } from "@/features/admin/audit";
import {
  addPriceTier,
  CatalogueAdminError,
  deactivatePriceTier,
  parseOptionalPesewas,
  savePriceTier,
} from "@/features/catalogue/admin";
import { canAccessAdmin } from "@/lib/staff/rbac";
import { readStaffActor } from "@/lib/staff/require";

const uuid = z.string().uuid();

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  const next = new URL("/admin/pricing", origin);
  const actor = await readStaffActor();
  if (!actor) {
    return NextResponse.redirect(new URL("/admin/login", origin), 303);
  }
  if (!canAccessAdmin(actor.role, "pricing", "write")) {
    next.searchParams.set("error", "This role cannot change price tiers.");
    return NextResponse.redirect(next, 303);
  }

  try {
    const formData = await request.formData();
    const intent = String(formData.get("intent") ?? "");
    if (intent === "deactivate-tier") {
      const tierId = uuid.parse(formData.get("tierId"));
      await deactivatePriceTier({
        role: actor.role,
        tierId,
      });
      await recordAdminAudit({ actorProfileId: actor.profileId, action: "price_tier_deactivated", resourceType: "price_tier", resourceId: tierId });
    } else if (intent === "save-tier") {
      const tierId = uuid.parse(formData.get("tierId"));
      const requestQuote = String(formData.get("requestQuote") ?? "") === "true";
      const maxRaw = String(formData.get("maximumQuantity") ?? "").trim();
      const minimumQuantity = Number(formData.get("minimumQuantity"));
      await savePriceTier({ role: actor.role, tierId, minimumQuantity, maximumQuantity: maxRaw ? Number(maxRaw) : null, unitPricePesewas: requestQuote ? null : parseOptionalPesewas(formData.get("unitPrice")), requestQuote });
      await recordAdminAudit({ actorProfileId: actor.profileId, action: "price_tier_updated", resourceType: "price_tier", resourceId: tierId, metadata: { minimumQuantity, requestQuote } });
    } else if (intent === "add-tier") {
      const requestQuote = String(formData.get("requestQuote") ?? "") === "true";
      const maxRaw = String(formData.get("maximumQuantity") ?? "").trim();
      const variantId = uuid.parse(formData.get("variantId"));
      const minimumQuantity = Number(formData.get("minimumQuantity"));
      await addPriceTier({
        role: actor.role,
        variantId,
        minimumQuantity,
        maximumQuantity: maxRaw ? Number(maxRaw) : null,
        unitPricePesewas: requestQuote ? null : parseOptionalPesewas(formData.get("unitPrice")),
        requestQuote,
      });
      await recordAdminAudit({ actorProfileId: actor.profileId, action: "price_tier_added", resourceType: "variant", resourceId: variantId, metadata: { minimumQuantity, requestQuote } });
    } else {
      next.searchParams.set("error", "Unknown pricing action.");
    }
  } catch (error) {
    const message =
      error instanceof CatalogueAdminError || error instanceof Error
        ? error.message
        : "Could not update pricing.";
    next.searchParams.set("error", message);
  }

  return NextResponse.redirect(next, 303);
}
