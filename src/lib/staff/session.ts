import { createHmac, timingSafeEqual } from "node:crypto";
import { isStaffProfileId, staffSecret } from "./constants";

const SESSION_MS = 60 * 60 * 12 * 1000;

export type StaffCookiePayload = {
  profileId: string;
  exp: number;
};

export function signStaffCookie(profileId: string, now = Date.now()) {
  const exp = now + SESSION_MS;
  const payload = `${profileId}.${exp}`;
  const signature = createHmac("sha256", staffSecret()).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

export function readStaffCookie(value: string | undefined): StaffCookiePayload | null {
  if (!value) {
    return null;
  }

  const lastDot = value.lastIndexOf(".");
  if (lastDot < 1) {
    return null;
  }

  const payload = value.slice(0, lastDot);
  const signature = value.slice(lastDot + 1);
  const expected = createHmac("sha256", staffSecret()).update(payload).digest("hex");
  const left = Buffer.from(expected);
  const right = Buffer.from(signature);
  if (left.length !== right.length || !timingSafeEqual(left, right)) {
    return null;
  }

  const [profileId, expRaw] = payload.split(".");
  const exp = Number(expRaw);
  if (!isStaffProfileId(profileId) || !Number.isFinite(exp) || exp < Date.now()) {
    return null;
  }

  return { profileId, exp };
}
