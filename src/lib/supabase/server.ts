import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { publicEnv } from "@/lib/env";

export async function createSupabaseServerClient() {
  // Prefer the public names used by browser clients, but also accept the
  // server-scoped aliases configured in production. These values never leave
  // this server-only module.
  const url =
    publicEnv.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL?.trim();
  const key =
    publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!url || !key) {
    throw new Error("Supabase public env is not configured");
  }

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component — middleware can refresh the session.
        }
      },
    },
  });
}
