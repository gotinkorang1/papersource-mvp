import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { isDatabaseConfigured } from "@/lib/db/client";
import { publicEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { readVerifiedCustomerIdentity, type CustomerActor } from "./identity";
import { synchronizeCustomerProfile } from "./profiles";
import { safeCustomerReturnPath } from "./return-path";

export type { CustomerActor } from "./identity";

export const readCustomerActor = cache(async (): Promise<CustomerActor | null> => {
  if (!isDatabaseConfigured() || !publicEnv.NEXT_PUBLIC_SUPABASE_URL || !publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) return null;
  const supabase = await createSupabaseServerClient();
  const identity = await readVerifiedCustomerIdentity(supabase.auth);
  if (!identity) return null;
  return synchronizeCustomerProfile(identity);
});

export async function requireCustomer(next: unknown = "/account"): Promise<CustomerActor> {
  const actor = await readCustomerActor();
  if (!actor) redirect(`/login?next=${encodeURIComponent(safeCustomerReturnPath(next))}`);
  return actor;
}
