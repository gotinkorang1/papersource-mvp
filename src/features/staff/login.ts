import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { adminRoles, profiles } from "@/lib/db/schema";
import { staffSecret } from "@/lib/staff/constants";
import { timingSafeEqual } from "node:crypto";

export class StaffAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StaffAuthError";
  }
}

function secretsMatch(provided: string, expected: string) {
  const left = Buffer.from(provided);
  const right = Buffer.from(expected);
  if (left.length !== right.length) {
    return false;
  }
  return timingSafeEqual(left, right);
}

export async function authenticateStaff(input: { email: string; secret: string }) {
  const email = input.email.trim().toLowerCase();
  if (!email || !input.secret) {
    throw new StaffAuthError("Email and staff secret are required.");
  }

  if (!secretsMatch(input.secret, staffSecret())) {
    throw new StaffAuthError("That staff sign-in is not valid.");
  }

  const db = getDb();
  const [row] = await db
    .select({
      profileId: profiles.id,
      email: profiles.email,
      role: adminRoles.role,
    })
    .from(adminRoles)
    .innerJoin(profiles, eq(profiles.id, adminRoles.profileId))
    .where(eq(profiles.email, email))
    .limit(1);

  if (!row) {
    throw new StaffAuthError("That staff sign-in is not valid.");
  }

  return row;
}
