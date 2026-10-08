import "server-only";
import { cookies } from "next/headers";

/** Remove only Supabase session cookies; guest cart identity must survive logout. */
export async function clearLocalSupabaseAuthCookies() {
  const cookieStore = await cookies();
  for (const { name } of cookieStore.getAll()) {
    if (/^sb-.+-auth-token(?:\.\d+)?$/.test(name)) cookieStore.delete(name);
  }
}
