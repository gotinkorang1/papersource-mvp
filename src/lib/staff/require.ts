import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { getDb } from "@/lib/db/client";
import { adminRoles, profiles } from "@/lib/db/schema";
import { canAccessAdmin, type AdminAction, type AdminArea } from "@/lib/staff/rbac";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { StaffActor } from "@/lib/staff/types";
import { isTransientAuthError } from "@/lib/auth/transient-error";

export type { StaffActor };

export type StaffActorStatus = { actor: StaffActor | null; unavailable: boolean };

export async function readStaffActorStatus(): Promise<StaffActorStatus> {
  let supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  try {
    supabase = await createSupabaseServerClient();
  } catch (error) {
    // Public storefront pages also call this helper to show staff-only edit
    // links. Missing optional auth configuration must not take the storefront
    // down; protected admin routes still fail closed through requireStaff.
    if (error instanceof Error && error.message === "Supabase public env is not configured") {
      return { actor: null, unavailable: false };
    }
    return { actor: null, unavailable: isTransientAuthError(error) };
  }
  let authResult: Awaited<ReturnType<typeof supabase.auth.getUser>>;
  try {
    authResult = await supabase.auth.getUser();
  } catch (error) {
    // Public storefront pages should remain renderable when Supabase auth is
    // restricted or temporarily unavailable. Protected routes still fail
    // closed through requireStaff and redirect to the staff sign-in screen.
    return { actor: null, unavailable: isTransientAuthError(error) };
  }
  const { data, error } = authResult;
  const email = data.user?.email?.trim().toLowerCase();
  if (error || !email) return { actor: null, unavailable: isTransientAuthError(error) };

  try {
    const db = getDb();
    const [row] = await db
      .select({
        profileId: profiles.id,
        email: profiles.email,
        fullName: profiles.fullName,
        phone: profiles.phone,
        role: adminRoles.role,
      })
      .from(adminRoles)
      .innerJoin(profiles, eq(profiles.id, adminRoles.profileId))
      .where(eq(profiles.email, email))
      .limit(1);

    return { actor: row ?? null, unavailable: false };
  } catch {
    // Identity is optional on public pages and on the login screen. If the
    // hosted database is temporarily restricted, fail closed without turning
    // the page into a 500; protected routes still redirect to sign-in.
    return { actor: null, unavailable: true };
  }
}

export async function readStaffActor(): Promise<StaffActor | null> {
  return (await readStaffActorStatus()).actor;
}

export async function requireStaff(): Promise<StaffActor> {
  const { actor, unavailable } = await readStaffActorStatus();
  if (!actor) {
    redirect(unavailable ? "/admin/login?retryable=1" : "/admin/login");
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

