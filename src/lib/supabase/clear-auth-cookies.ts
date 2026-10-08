import "server-only";
import { cookies } from "next/headers";

/** Match only Supabase session cookie chunks, never guest or application cookies. */
export function isSupabaseAuthCookieName(name: string) {
  return /^sb-.+-auth-token(?:\.\d+)?$/.test(name);
}

/** Remove only Supabase session cookies; guest cart identity must survive logout. */
export async function clearLocalSupabaseAuthCookies() {
  const cookieStore = await cookies();
  for (const { name } of cookieStore.getAll()) {
    if (isSupabaseAuthCookieName(name)) cookieStore.delete(name);
  }
}
