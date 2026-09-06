import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { adminRoles, profiles } from "@/lib/db/schema";
import { readStaffActor } from "@/lib/staff/require";
import { canAccessAdmin } from "@/lib/staff/rbac";
import { recordAdminAudit } from "@/features/admin/audit";

const roleSchema = z.enum(["super_admin", "admin", "sales", "warehouse", "content_manager"]);

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  const next = new URL("/admin/users", origin);
  const actor = await readStaffActor();
  if (!actor) return NextResponse.redirect(new URL("/admin/login", origin), 303);
  if (!canAccessAdmin(actor.role, "roles", "write")) {
    next.searchParams.set("error", "Only super admins can change staff roles.");
    return NextResponse.redirect(next, 303);
  }
  try {
    const formData = await request.formData();
    const profileId = z.string().uuid().parse(formData.get("profileId"));
    const role = roleSchema.parse(formData.get("role"));
    if (actor.profileId === profileId && role !== "super_admin") {
      throw new Error("You cannot remove your own super admin access.");
    }

    const db = getDb();
    const [profile] = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.id, profileId)).limit(1);
    if (!profile) throw new Error("Staff profile not found.");
    await db.insert(adminRoles).values({ profileId, role }).onConflictDoUpdate({ target: adminRoles.profileId, set: { role } });
    await recordAdminAudit({ actorProfileId: actor.profileId, action: "role_updated", resourceType: "profile", resourceId: profileId, metadata: { role } });
    next.searchParams.set("success", "1");
    return NextResponse.redirect(next, 303);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update staff role.";
    next.searchParams.set("error", message);
    return NextResponse.redirect(next, 303);
  }
}
