import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { adminRoles, profiles } from "@/lib/db/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export class StaffAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StaffAuthError";
  }
}

export async function authenticateStaff(input: { email: string; password: string }) {
  const email = input.email.trim().toLowerCase();
  if (!email || !input.password) {
    throw new StaffAuthError("Email and password are required.");
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: input.password });
  if (error || !data.user?.email) throw new StaffAuthError("That staff sign-in is not valid.");

  const db = getDb();
  const [row] = await db
    .select({
      profileId: profiles.id,
      email: profiles.email,
      role: adminRoles.role,
    })
    .from(adminRoles)
    .innerJoin(profiles, eq(profiles.id, adminRoles.profileId))
    .where(eq(profiles.email, data.user.email.toLowerCase()))
    .limit(1);

  if (!row) {
    await supabase.auth.signOut();
    throw new StaffAuthError("That staff sign-in is not valid.");
  }

  return row;
}
