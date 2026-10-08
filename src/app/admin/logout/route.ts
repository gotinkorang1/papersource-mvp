import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  // Logout should remain deterministic even when Auth is rate-limited or
  // temporarily restricted. The browser is still sent to the sign-in page;
  // a later request can refresh/revoke the server session once service returns.
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut({ scope: "local" });
  } catch {
    // Deliberately avoid exposing provider/quota details in the redirect.
  }
  const response = NextResponse.redirect(new URL("/admin/login", request.url), 303);
  return response;
}
