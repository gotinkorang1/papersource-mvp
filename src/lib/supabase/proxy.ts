import "server-only";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { publicEnv } from "@/lib/env";

export async function refreshSupabaseSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = publicEnv.NEXT_PUBLIC_SUPABASE_URL;
  const key = publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return response;

  // Anonymous storefront requests do not have a session to refresh. Avoid
  // making an Auth round trip for them; this keeps public browsing cheap and
  // reduces unnecessary Supabase egress while preserving refresh behavior for
  // both unchunked and chunked SSR auth cookies.
  const hasAuthCookie = request.cookies.getAll().some(({ name }) =>
    name.startsWith("sb-") && name.includes("-auth-token"),
  );
  if (!hasAuthCookie) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        const previous = response;
        response = NextResponse.next({ request });
        // Repeated SDK writes must not discard earlier cookie chunks or headers.
        for (const cookie of previous.cookies.getAll()) response.cookies.set(cookie);
        for (const [name, value] of previous.headers) {
          if (!name.startsWith("x-middleware-") && name !== "set-cookie") response.headers.set(name, value);
        }
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
        for (const [name, value] of Object.entries(headers)) response.headers.set(name, value);
      },
    },
  });
  await supabase.auth.getClaims();
  return response;
}
