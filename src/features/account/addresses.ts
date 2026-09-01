import "server-only";
import { and, desc, eq, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { addresses, profiles } from "@/lib/db/schema";
import type { GhanaAddressValues } from "@/components/commerce/ghana-address-form";
import { personalAddressSchema } from "./actions-state";

export class AccountError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AccountError";
  }
}

function personalAddresses(profileId: string) {
  return and(eq(addresses.ownerProfileId, profileId), isNull(addresses.organizationId));
}

type Transaction = Parameters<Parameters<ReturnType<typeof getDb>["transaction"]>[0]>[0];

async function lockProfile(tx: Transaction, profileId: string) {
  const [profile] = await tx.select({ id: profiles.id }).from(profiles).where(eq(profiles.id, profileId)).for("update");
  if (!profile) throw new AccountError("Your account is unavailable. Please sign in again.");
}

export async function listCustomerAddresses(profileId: string) {
  const db = getDb();
  return db
    .select()
    .from(addresses)
    .where(personalAddresses(profileId))
    .orderBy(desc(addresses.isDefault), desc(addresses.updatedAt));
}

export async function saveCustomerAddress(input: {
  profileId: string;
  addressId?: string;
  values: GhanaAddressValues;
  isDefault: boolean;
}) {
  const parsed = personalAddressSchema.safeParse(input.values);
  if (!parsed.success) throw new AccountError("Check the address fields and phone number.");
  const values = {
    ownerProfileId: input.profileId,
    fullName: parsed.data.fullName,
    phone: parsed.data.phone,
    region: parsed.data.region,
    cityTown: parsed.data.cityTown,
    areaSuburb: parsed.data.areaSuburb || null,
    streetLandmark: parsed.data.streetLandmark || null,
    ghanapostGps: parsed.data.ghanapostGps || null,
    deliveryInstructions: parsed.data.deliveryInstructions || null,
    deliveryArea: parsed.data.deliveryArea,
    isDefault: input.isDefault,
    updatedAt: new Date(),
  };
  return getDb().transaction(async (tx) => {
    // Serialize even first-address creation, when there is no address row to lock.
    await lockProfile(tx, input.profileId);
    const ownedAddress = input.addressId ? and(eq(addresses.id, input.addressId), personalAddresses(input.profileId)) : undefined;
    if (ownedAddress) {
      const [existing] = await tx.select({ id: addresses.id }).from(addresses).where(ownedAddress);
      if (!existing) throw new AccountError("That address was not found.");
    }
    if (input.isDefault) {
      await tx.update(addresses).set({ isDefault: false, updatedAt: new Date() }).where(personalAddresses(input.profileId));
    }
    const [saved] = ownedAddress
      ? await tx.update(addresses).set(values).where(ownedAddress).returning()
      : await tx.insert(addresses).values(values).returning();
    if (!saved) throw new AccountError("Could not save that address.");
    return saved;
  });
}

export async function removeCustomerAddress(profileId: string, addressId: string) {
  return getDb().transaction(async (tx) => {
    await lockProfile(tx, profileId);
    const [removed] = await tx.delete(addresses).where(and(eq(addresses.id, addressId), personalAddresses(profileId))).returning({ id: addresses.id });
    if (!removed) throw new AccountError("That address was not found.");
  });
}

export async function setDefaultCustomerAddress(profileId: string, addressId: string) {
  return getDb().transaction(async (tx) => {
    await lockProfile(tx, profileId);
    const ownedAddress = and(eq(addresses.id, addressId), personalAddresses(profileId));
    const [existing] = await tx.select({ id: addresses.id }).from(addresses).where(ownedAddress);
    if (!existing) throw new AccountError("That address was not found.");
    await tx.update(addresses).set({ isDefault: false, updatedAt: new Date() }).where(personalAddresses(profileId));
    await tx.update(addresses).set({ isDefault: true, updatedAt: new Date() }).where(ownedAddress);
  });
}
