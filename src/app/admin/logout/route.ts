import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function clearLocalAuthCookies() {
  const cookieStore = await cookies();
  for (const { name } of cookieStore.getAll()) {
    if (/^sb-.+-auth-token(?:\.\d+)?$/.test(name)) cookieStore.delete(name);
  }
}

export async function POST(request: Request) {
  // Logout should remain deterministic even when Auth is rate-limited or
  // temporarily restricted. The browser is still sent to the sign-in page;
  // a later request can refresh/revoke the server session once service returns.
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) await clearLocalAuthCookies();
  } catch {
    // Deliberately avoid exposing provider/quota details in the redirect.
    await clearLocalAuthCookies();
  }
  const response = NextResponse.redirect(new URL("/admin/login", request.url), 303);
  return response;
}
