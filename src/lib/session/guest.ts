import { cookies } from "next/headers";
import {
  GUEST_SESSION_COOKIE,
  guestSessionCookieOptions,
  isGuestSessionId,
} from "@/lib/session/constants";

export { GUEST_SESSION_COOKIE, isGuestSessionId };

export async function readGuestSessionId() {
  const jar = await cookies();
  const value = jar.get(GUEST_SESSION_COOKIE)?.value;
  return isGuestSessionId(value) ? value : null;
}

export async function getOrCreateGuestSessionId() {
  const existing = await readGuestSessionId();
  if (existing) {
    return existing;
  }

  const sessionId = crypto.randomUUID();
  const jar = await cookies();
  jar.set(GUEST_SESSION_COOKIE, sessionId, guestSessionCookieOptions());
  return sessionId;
}
