import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { isDatabaseConfigured } from "@/lib/db/client";
import { publicEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { readVerifiedCustomerIdentityWithError, type CustomerActor } from "./identity";
import { synchronizeCustomerProfile } from "./profiles";
import { safeCustomerReturnPath } from "./return-path";

export type { CustomerActor } from "./identity";

export type CustomerActorStatus = { actor: CustomerActor | null; unavailable: boolean };

function isTransientAuthDependency(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { status?: unknown; code?: unknown };
  const status = typeof candidate.status === "number" ? candidate.status : null;
  const code = typeof candidate.code === "string" ? candidate.code : "";
  return status === 402 || status === 408 || status === 425 || status === 429 || (status !== null && status >= 500) || [
    "over_request_rate_limit", "rate_limit_exceeded", "service_unavailable", "temporarily_unavailable",
    "bad_gateway", "gateway_timeout", "internal_server_error", "database_unavailable",
  ].includes(code);
}

export const readCustomerActorStatus = cache(async (): Promise<CustomerActorStatus> => {
  if (!isDatabaseConfigured() || !publicEnv.NEXT_PUBLIC_SUPABASE_URL || (!publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY && !publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY)) return { actor: null, unavailable: false };
  let identity: CustomerActor | null;
  try {
    const supabase = await createSupabaseServerClient();
    const result = await readVerifiedCustomerIdentityWithError(supabase.auth);
    if (!result.identity) return { actor: null, unavailable: isTransientAuthDependency(result.error) };
    identity = result.identity;
  } catch (error) {
    // Public entry points (login, register, product pages and navigation) must
    // remain renderable when Auth is temporarily unavailable. Protected routes
    // still require a verified actor and will redirect through requireCustomer.
    return { actor: null, unavailable: isTransientAuthDependency(error) };
  }
  try {
    return { actor: await synchronizeCustomerProfile(identity), unavailable: false };
  } catch (error) {
    // Staff profiles are provisioned separately from customer Auth profiles.
    // If the same email belongs to that staff profile, do not let storefront
    // chrome fail; the user can still browse as a guest.
    if (error instanceof Error && error.message === "Customer profile unavailable.") {
      return { actor: null, unavailable: false };
    }
    if (isTransientAuthDependency(error)) return { actor: null, unavailable: true };
    throw error;
  }
});

export const readCustomerActor = cache(async (): Promise<CustomerActor | null> => (await readCustomerActorStatus()).actor);

export async function requireCustomer(next: unknown = "/account"): Promise<CustomerActor> {
  const actor = await readCustomerActor();
  if (!actor) redirect(`/login?next=${encodeURIComponent(safeCustomerReturnPath(next))}`);
  return actor;
}
