import { NextResponse } from "next/server";
import { z } from "zod";
import { CatalogueAdminError, saveCategory } from "@/features/catalogue/admin";
import { canAccessAdmin } from "@/lib/staff/rbac";
import { readStaffActor } from "@/lib/staff/require";

const uuid = z.string().uuid();

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  const next = new URL("/admin/categories", origin);
  const actor = await readStaffActor();
  if (!actor) {
    return NextResponse.redirect(new URL("/admin/login", origin), 303);
  }
  if (!canAccessAdmin(actor.role, "categories", "write")) {
    next.searchParams.set("error", "This role cannot change categories.");
    return NextResponse.redirect(next, 303);
  }

  try {
    const formData = await request.formData();
    const parentRaw = String(formData.get("parentId") ?? "").trim();
    await saveCategory({
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
  } catch (error) {
    const message =
      error instanceof CatalogueAdminError || error instanceof Error
        ? error.message
        : "Could not save that category.";
    next.searchParams.set("error", message);
  }

  return NextResponse.redirect(next, 303);
}
