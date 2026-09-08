import { NextResponse } from "next/server";
import { z } from "zod";
import { recordAdminAudit } from "@/features/admin/audit";
import { CatalogueAdminError, saveBrand } from "@/features/catalogue/admin";
import { canAccessAdmin } from "@/lib/staff/rbac";
import { readStaffActor } from "@/lib/staff/require";

const uuid = z.string().uuid();

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  const next = new URL("/admin/brands", origin);
  const wantsJson = request.headers.get("accept")?.includes("application/json") ?? false;
  const actor = await readStaffActor();
  if (!actor) {
    return NextResponse.redirect(new URL("/admin/login", origin), 303);
  }
  if (!canAccessAdmin(actor.role, "brands", "write")) {
    if (wantsJson) return NextResponse.json({ error: "This role cannot change brands." }, { status: 403 });
    next.searchParams.set("error", "This role cannot change brands.");
    return NextResponse.redirect(next, 303);
  }

  try {
    const formData = await request.formData();
    const intent = String(formData.get("intent"));
    const saved = await saveBrand({
      role: actor.role,
      brandId:
        String(formData.get("intent")) === "save-brand"
          ? uuid.parse(formData.get("brandId"))
          : undefined,
      name: String(formData.get("name") ?? ""),
      slug: String(formData.get("slug") ?? ""),
      active: String(formData.get("active") ?? "true") === "true",
    });
    await recordAdminAudit({ actorProfileId: actor.profileId, action: intent === "save-brand" ? "brand_updated" : "brand_created", resourceType: "brand", resourceId: saved.id });
    if (wantsJson) return NextResponse.json({ item: { id: saved.id, name: saved.name } });
  } catch (error) {
    const message =
      error instanceof CatalogueAdminError || error instanceof Error
        ? error.message
        : "Could not save that brand.";
    next.searchParams.set("error", message);
    if (wantsJson) return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.redirect(next, 303);
}
