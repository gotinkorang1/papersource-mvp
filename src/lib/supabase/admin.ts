import "server-only";
import { createClient } from "@supabase/supabase-js";

/** Service-role client. Server only. Never import from a Client Component. */
export function createSupabaseServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    throw new Error(
      "STORAGE_MODE=live requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY",
    );
  }
  if (key.startsWith("NEXT_PUBLIC_")) {
    throw new Error("Service role key must not be a public env value");
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
