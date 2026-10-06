import { z } from "zod";

const optionalUrl = z.string().url().optional().or(z.literal(""));

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: optionalUrl,
  NEXT_PUBLIC_SUPABASE_URL: optionalUrl,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().optional(),
  // Supabase used this name before publishable keys were introduced. Keep it
  // as a compatibility alias so existing deployments do not lose auth.
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: z.string().optional(),
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().optional(),
  NEXT_PUBLIC_CLARITY_PROJECT_ID: z.string().optional(),
  NEXT_PUBLIC_SOCIAL_AUTH_ENABLED: z.enum(["true", "false"]).optional(),
});

export const publicEnv = publicEnvSchema.parse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  NEXT_PUBLIC_CLARITY_PROJECT_ID: process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID,
  NEXT_PUBLIC_SOCIAL_AUTH_ENABLED: process.env.NEXT_PUBLIC_SOCIAL_AUTH_ENABLED,
});

// Social OAuth stays off by default while Supabase Auth is restricted. Tests
// keep the controls enabled so the callback contract remains covered.
export const socialAuthEnabled = process.env.NODE_ENV === "test"
  || publicEnv.NEXT_PUBLIC_SOCIAL_AUTH_ENABLED === "true";

export function assertServerSecret(name: string, value: string | undefined) {
  if (name.startsWith("NEXT_PUBLIC_")) {
    throw new Error(`${name} is public and must not be treated as a secret`);
  }

  if (!value) {
    throw new Error(`${name} is required on the server`);
  }

  return value;
}
