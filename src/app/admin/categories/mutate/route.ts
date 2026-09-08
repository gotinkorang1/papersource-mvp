import { NextResponse } from "next/server";
import { z } from "zod";
import { recordAdminAudit } from "@/features/admin/audit";
import { bulkSetCategoriesActive, CatalogueAdminError, saveCategory } from "@/features/catalogue/admin";
import { canAccessAdmin } from "@/lib/staff/rbac";
import { readStaffActor } from "@/lib/staff/require";

const uuid = z.string().uuid();

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  const next = new URL("/admin/categories", origin);
  const wantsJson = request.headers.get("accept")?.includes("application/json") ?? false;
  const actor = await readStaffActor();
  if (!actor) {
    return NextResponse.redirect(new URL("/admin/login", origin), 303);
  }
  if (!canAccessAdmin(actor.role, "categories", "write")) {
    if (wantsJson) return NextResponse.json({ error: "This role cannot change categories." }, { status: 403 });
    next.searchParams.set("error", "This role cannot change categories.");
    return NextResponse.redirect(next, 303);
  }

  try {
    const formData = await request.formData();
    const intent = String(formData.get("intent"));
    if (intent === "bulk-active") {
      const count = await bulkSetCategoriesActive(actor.role, formData.getAll("categoryId").map(String), String(formData.get("active")) === "true");
      next.searchParams.set("message", `${count} categor${count === 1 ? "y" : "ies"} updated.`);
      return NextResponse.redirect(next, 303);
    }
    const parentRaw = String(formData.get("parentId") ?? "").trim();
    const saved = await saveCategory({
      role: actor.role,
      categoryId:
        String(formData.get("intent")) === "save-category"
          ? uuid.parse(formData.get("categoryId"))
          : undefined,
      name: String(formData.get("name") ?? ""),
      slug: String(formData.get("slug") ?? ""),
      parentId: parentRaw ? uuid.parse(parentRaw) : null,
      description: String(formData.get("description") ?? ""),
      position: Number(formData.get("position") ?? 0),
      active: String(formData.get("active") ?? "true") === "true",
    });
    await recordAdminAudit({ actorProfileId: actor.profileId, action: intent === "save-category" ? "category_updated" : "category_created", resourceType: "category", resourceId: saved.id });
    if (wantsJson) return NextResponse.json({ item: { id: saved.id, name: saved.name, parentId: saved.parentId } });
  } catch (error) {
    const message =
      error instanceof CatalogueAdminError || error instanceof Error
        ? error.message
        : "Could not save that category.";
    next.searchParams.set("error", message);
    if (wantsJson) return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.redirect(next, 303);
}
