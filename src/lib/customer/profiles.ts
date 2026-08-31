import "server-only";
import { eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { profiles } from "@/lib/db/schema";
import type { CustomerActor } from "./identity";

/** Server-internal only. Identity must come from verified Supabase claims. */
export async function synchronizeCustomerProfile(identity: CustomerActor): Promise<CustomerActor> {
  const email = identity.email.toLowerCase();
  return getDb().transaction(async (tx) => {
    const [emailOwner] = await tx.select({ id: profiles.id }).from(profiles)
      .where(sql`lower(${profiles.email}) = ${email}`).limit(1);
    if (emailOwner && emailOwner.id !== identity.profileId) throw new Error("Customer profile unavailable.");

    await tx.insert(profiles).values({
      id: identity.profileId, email, fullName: identity.fullName, phone: identity.phone,
    }).onConflictDoNothing();
    const [profile] = await tx.select({
      profileId: profiles.id, email: profiles.email, fullName: profiles.fullName, phone: profiles.phone,
    }).from(profiles).where(eq(profiles.id, identity.profileId)).limit(1);
    // An email conflict must never fall back to the email owner's profile.
    if (!profile) throw new Error("Customer profile unavailable.");
    if (profile.email !== email) {
      await tx.update(profiles).set({ email, updatedAt: new Date() }).where(eq(profiles.id, identity.profileId));
    }
    return { ...profile, email };
  }).catch((error: unknown) => {
    const cause = error instanceof Error ? error.cause : undefined;
    const isUniqueViolation = (value: unknown) => typeof value === "object" && value !== null && "code" in value && value.code === "23505";
    if (isUniqueViolation(error) || isUniqueViolation(cause)) throw new Error("Customer profile unavailable.");
    throw error;
  });
}
