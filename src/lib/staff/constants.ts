export const STAFF_SESSION_COOKIE = "ps_staff";
export const STAFF_DEV_SECRET = "sk_staff_papersource_local";
export const STAFF_DEV_EMAIL = "sales@papersource.test";

const PROFILE_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isStaffProfileId(value: string | undefined): value is string {
  return Boolean(value && PROFILE_ID.test(value));
}

export function staffSecret() {
  const configured = process.env.STAFF_DEV_SECRET?.trim();
  if (configured) {
    return configured;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("STAFF_DEV_SECRET is required in production until Supabase staff auth is live");
  }

  return STAFF_DEV_SECRET;
}

export function staffSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 12,
  };
}
