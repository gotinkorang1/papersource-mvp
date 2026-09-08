import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { adminRoles, profiles } from "@/lib/db/schema";
import { readStaffActor } from "@/lib/staff/require";
import { canAccessAdmin } from "@/lib/staff/rbac";
import { recordAdminAudit } from "@/features/admin/audit";
import { createSupabaseServiceClient } from "@/lib/supabase/admin";

const roleSchema = z.enum(["super_admin", "admin", "sales", "warehouse", "content_manager"]);
const emailSchema = z.string().trim().email().max(320);
const nameSchema = z.string().trim().min(2).max(120);

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
    const intent = formData.get("intent");
    if (intent === "invite") {
      const email = emailSchema.parse(formData.get("email")).toLowerCase();
      const fullName = nameSchema.parse(formData.get("fullName"));
      const role = roleSchema.parse(formData.get("role"));
      const db = getDb();
      const [existingProfile] = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.email, email)).limit(1);
      if (existingProfile) throw new Error("A profile already exists for that email. Update its role below instead.");

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || origin;
      const supabase = createSupabaseServiceClient();
      const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
        data: { full_name: fullName },
        redirectTo: `${siteUrl}/auth/confirm?next=/admin`,
      });
      if (error || !data.user) throw new Error("Could not send the staff invitation. Check the email and try again.");

      try {
        await db.insert(profiles).values({ id: data.user.id, email, fullName });
        await db.insert(adminRoles).values({ profileId: data.user.id, role });
      } catch (error) {
        await supabase.auth.admin.deleteUser(data.user.id);
        throw error;
      }
      await recordAdminAudit({ actorProfileId: actor.profileId, action: "staff_invited", resourceType: "profile", resourceId: data.user.id, metadata: { role } });
      next.searchParams.set("success", "invited");
      return NextResponse.redirect(next, 303);
    }
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
    const allowedMessages = new Set([
      "A profile already exists for that email. Update its role below instead.",
      "Could not send the staff invitation. Check the email and try again.",
      "You cannot remove your own super admin access.",
      "Staff profile not found.",
    ]);
    const message = error instanceof Error && allowedMessages.has(error.message)
      ? error.message
      : "Unable to update staff role. Please check the fields and try again.";
    next.searchParams.set("error", message);
    return NextResponse.redirect(next, 303);
  }
}
