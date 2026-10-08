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
  if (!isDatabaseConfigured() || !publicEnv.NEXT_PUBLIC_SUPABASE_URL || (!publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY && !publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY)) return null;
  let identity: CustomerActor | null;
  try {
    const supabase = await createSupabaseServerClient();
    identity = await readVerifiedCustomerIdentity(supabase.auth);
  } catch {
    // Public entry points (login, register, product pages and navigation) must
    // remain renderable when Auth is temporarily unavailable. Protected routes
    // still require a verified actor and will redirect through requireCustomer.
    return null;
  }
  if (!identity) return null;
  try {
    return await synchronizeCustomerProfile(identity);
  } catch (error) {
    // Staff profiles are provisioned separately from customer Auth profiles.
    // If the same email belongs to that staff profile, do not let storefront
    // chrome fail; the user can still browse as a guest.
    if (error instanceof Error && error.message === "Customer profile unavailable.") {
      return null;
    }
    throw error;
  }
});

export async function requireCustomer(next: unknown = "/account"): Promise<CustomerActor> {
  const actor = await readCustomerActor();
  if (!actor) redirect(`/login?next=${encodeURIComponent(safeCustomerReturnPath(next))}`);
  return actor;
}
