import "server-only";
import { readCustomerActor } from "./require";
import { getOrCreateGuestSessionId, readGuestSessionId } from "@/lib/session/guest";
import type { CommerceIdentity } from "./commerce-identity";

export async function readCommerceIdentity(createGuest = false): Promise<CommerceIdentity> {
  const customer = await readCustomerActor();
  const sessionId = createGuest ? await getOrCreateGuestSessionId() : await readGuestSessionId();
  return { profileId: customer?.profileId ?? null, sessionId };
}
