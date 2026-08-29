import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { getDb } from "@/lib/db/client";
import { adminRoles, profiles } from "@/lib/db/schema";
import {
  STAFF_SESSION_COOKIE,
  staffSessionCookieOptions,
} from "@/lib/staff/constants";
import { canAccessAdmin, type AdminAction, type AdminArea } from "@/lib/staff/rbac";
import { readStaffCookie, signStaffCookie } from "@/lib/staff/session";
import type { StaffActor } from "@/lib/staff/types";

export type { StaffActor };

export async function readStaffActor(): Promise<StaffActor | null> {
  const jar = await cookies();
  const parsed = readStaffCookie(jar.get(STAFF_SESSION_COOKIE)?.value);
  if (!parsed) {
    return null;
  }

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
    .where(eq(adminRoles.profileId, parsed.profileId))
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

export async function setStaffSessionCookie(profileId: string) {
  const jar = await cookies();
  jar.set(STAFF_SESSION_COOKIE, signStaffCookie(profileId), staffSessionCookieOptions());
}

export async function clearStaffSessionCookie() {
  const jar = await cookies();
  jar.set(STAFF_SESSION_COOKIE, "", { ...staffSessionCookieOptions(), maxAge: 0 });
}
