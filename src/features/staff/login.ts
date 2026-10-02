import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { adminRoles, profiles } from "@/lib/db/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isStaffAuthServiceUnavailable } from "./auth-errors";

export class StaffAuthError extends Error {
  constructor(message: string, public readonly code: "invalid" | "unavailable" = "invalid") {
    super(message);
    this.name = "StaffAuthError";
  }
}

export async function authenticateStaff(input: { email: string; password: string }) {
  const email = input.email.trim().toLowerCase();
  if (!email || !input.password) {
    throw new StaffAuthError("Email and password are required.");
  }

  let supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  try {
    supabase = await createSupabaseServerClient();
  } catch {
    throw new StaffAuthError("Admin sign-in is temporarily unavailable. Please try again when the authentication service is restored.", "unavailable");
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password: input.password });
  if (error) {
    if (isStaffAuthServiceUnavailable(error)) {
      throw new StaffAuthError("Admin sign-in is temporarily unavailable because the authentication service has reached a usage limit. Please try again later.", "unavailable");
    }
    throw new StaffAuthError("That staff sign-in is not valid.");
  }
  if (!data.user?.email) throw new StaffAuthError("That staff sign-in is not valid.");

  let row: { profileId: string; email: string; role: "super_admin" | "admin" | "sales" | "warehouse" | "content_manager" } | undefined;
  try {
    const db = getDb();
    [row] = await db
      .select({
        profileId: profiles.id,
        email: profiles.email,
        role: adminRoles.role,
      })
      .from(adminRoles)
      .innerJoin(profiles, eq(profiles.id, adminRoles.profileId))
      .where(eq(profiles.email, data.user.email.toLowerCase()))
      .limit(1);
  } catch {
    try { await supabase.auth.signOut({ scope: "local" }); } catch { /* Keep the failure neutral. */ }
    throw new StaffAuthError("Admin sign-in is temporarily unavailable because the staff directory could not be reached. Please try again later.", "unavailable");
  }

  if (!row) {
    await supabase.auth.signOut();
    throw new StaffAuthError("That staff sign-in is not valid.");
  }

  return row;
}
