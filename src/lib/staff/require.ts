import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { getDb } from "@/lib/db/client";
import { adminRoles, profiles } from "@/lib/db/schema";
import { canAccessAdmin, type AdminAction, type AdminArea } from "@/lib/staff/rbac";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { StaffActor } from "@/lib/staff/types";

export type { StaffActor };

export async function readStaffActor(): Promise<StaffActor | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  const email = data.user?.email?.trim().toLowerCase();
  if (error || !email) return null;

  const db = getDb();
  const [row] = await db
    .select({
      profileId: profiles.id,
      email: profiles.email,
      fullName: profiles.fullName,
      role: adminRoles.role,
    })
    .from(adminRoles)
    .innerJoin(profiles, eq(profiles.id, adminRoles.profileId))
    .where(eq(profiles.email, email))
    .limit(1);

  return row ?? null;
}

export async function requireStaff(): Promise<StaffActor> {
  const actor = await readStaffActor();
  if (!actor) {
    redirect("/admin/login");
  }
  return actor;
}

export async function requireStaffArea(area: AdminArea, action: AdminAction) {
  const actor = await requireStaff();
  if (!canAccessAdmin(actor.role, area, action)) {
    notFound();
  }
  return actor;
}

