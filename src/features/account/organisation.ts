import "server-only";
import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { organizationMembers, organizations, profiles } from "@/lib/db/schema";
import { AccountError } from "./addresses";
import { organisationSchema } from "./actions-state";

export async function getCustomerOrganisation(profileId: string) {
  const db = getDb();
  const [row] = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      email: organizations.email,
      phone: organizations.phone,
      type: organizations.type,
      role: organizationMembers.role,
    })
    .from(organizationMembers)
    .innerJoin(organizations, eq(organizations.id, organizationMembers.organizationId))
    .where(eq(organizationMembers.profileId, profileId))
    .limit(1);
  return row ?? null;
}

export async function saveCustomerOrganisation(input: {
  profileId: string;
  name: string;
  type: string;
  email: string;
  phone: string;
}) {
  const parsed = organisationSchema.safeParse(input);
  if (!parsed.success) throw new AccountError("Check the organisation name, type and contact details.");
  const values = { ...parsed.data, email: parsed.data.email || null, phone: parsed.data.phone || null };
  return getDb().transaction(async (tx) => {
    const [profile] = await tx.select({ id: profiles.id }).from(profiles).where(eq(profiles.id, input.profileId)).for("update");
    if (!profile) throw new AccountError("Your account is unavailable. Please sign in again.");
    const [membership] = await tx.select().from(organizationMembers).where(eq(organizationMembers.profileId, input.profileId)).for("update");
    if (membership) {
      if (membership.role !== "owner") throw new AccountError("Only the organisation owner can edit these details.");
      const owned = tx.select({ id: organizationMembers.organizationId }).from(organizationMembers).where(and(eq(organizationMembers.profileId, input.profileId), eq(organizationMembers.role, "owner")));
      const [updated] = await tx.update(organizations).set({ ...values, updatedAt: new Date() }).where(and(eq(organizations.id, membership.organizationId), inArray(organizations.id, owned))).returning();
      if (!updated) throw new AccountError("The organisation is unavailable.");
      return updated;
    }
    const [created] = await tx.insert(organizations).values(values).returning();
    if (!created) throw new AccountError("Could not save the organisation.");
    await tx.insert(organizationMembers).values({ organizationId: created.id, profileId: input.profileId, role: "owner" });
    return created;
  });
}
