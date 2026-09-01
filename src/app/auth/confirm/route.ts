import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { createCustomerAuthService } from "@/features/account/auth-service";
import { mergeGuestCommerce } from "@/features/account/merge";
import { synchronizeCustomerProfile } from "@/lib/customer/profiles";
import { publicEnv } from "@/lib/env";
import { GUEST_SESSION_COOKIE, isGuestSessionId } from "@/lib/session/constants";

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type");
  const failurePath = type === "recovery" ? "/forgot-password?authError=confirmation" : "/login?authError=confirmation";
  // Construct a clean URL; never carry token_hash or other untrusted query data.
  const response = NextResponse.redirect(new URL(failurePath, request.url), 303);
  response.headers.set("Cache-Control", "private, no-cache, no-store, must-revalidate, max-age=0");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  response.headers.set("Referrer-Policy", "no-referrer");

  const url = publicEnv.NEXT_PUBLIC_SUPABASE_URL;
  const key = publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const siteUrl = publicEnv.NEXT_PUBLIC_SITE_URL;
  if (!url || !key || !siteUrl) return response;

  try {
    const client = createServerClient(url, key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet, headers) {
          for (const { name, value, options } of cookiesToSet) {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          }
          for (const [name, value] of Object.entries(headers)) response.headers.set(name, value);
        },
      },
    });
    const service = createCustomerAuthService({ auth: client.auth, siteUrl, synchronizeProfile: synchronizeCustomerProfile });
    const result = await service.confirm({
      tokenHash: request.nextUrl.searchParams.get("token_hash"),
      type,
      next: request.nextUrl.searchParams.get("next"),
    });
    if (result.status !== "signed_in") return response;

    try {
      const guestCookie = request.cookies.get(GUEST_SESSION_COOKIE)?.value;
      await mergeGuestCommerce({ profileId: result.customer.profileId, sessionId: isGuestSessionId(guestCookie) ? guestCookie : null });
    } catch {
      try { await client.auth.signOut({ scope: "local" }); } catch { /* Keep failure neutral. */ }
      return response;
    }
    // Preserve every cookie chunk/cache header already written by the SDK.
    response.headers.set("Location", new URL(result.next, siteUrl).toString());
  } catch { /* No provider errors or token-bearing URLs in logs or responses. */ }
  return response;
}
