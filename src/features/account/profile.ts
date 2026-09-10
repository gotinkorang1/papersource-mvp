import "server-only";

import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { profiles } from "@/lib/db/schema";
import { AccountError } from "./addresses";
import { customerProfileSchema } from "./actions-state";

export async function saveCustomerProfile(input: { profileId: string; fullName: string; phone: string }) {
  const parsed = customerProfileSchema.safeParse({ fullName: input.fullName, phone: input.phone });
  if (!parsed.success) throw new AccountError("Check your name and phone number.");
  const [saved] = await getDb().update(profiles).set({ ...parsed.data, phone: parsed.data.phone || null, updatedAt: new Date() }).where(eq(profiles.id, input.profileId)).returning({ fullName: profiles.fullName, phone: profiles.phone });
  if (!saved) throw new AccountError("Your account is unavailable. Please sign in again.");
  return saved;
}
