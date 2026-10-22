import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { refreshSupabaseSession } from "@/lib/supabase/proxy";
import {
  GUEST_SESSION_COOKIE,
  guestSessionCookieOptions,
  isGuestSessionId,
} from "@/lib/session/constants";

function isBareFlagHomepageRequest(request: NextRequest) {
  if (request.nextUrl.pathname !== "/" || !["GET", "HEAD"].includes(request.method)) return false;
  // Next.js may normalise `?MA` to `?MA=`, so test parsed values, not raw text.
  const params = [...request.nextUrl.searchParams];
  return params.length > 0 && params.every(([, value]) => value === "");
}

export async function proxy(request: NextRequest) {
  // `/cgi-bin/` is a legacy hosting path. It is not part of the Next.js
  // application, so return an explicit permanent removal signal instead of
  // allowing the platform to answer with an opaque 403 to crawlers.
  if (request.nextUrl.pathname === "/cgi-bin" || request.nextUrl.pathname.startsWith("/cgi-bin/")) {
    return new NextResponse(null, {
      status: 410,
      headers: { "Cache-Control": "public, max-age=86400" },
    });
  }

  // Stray links such as `/?MA` serve the homepage under a valueless flag. The
  // canonical tag already points at `/`, but Search Console keeps reporting
  // these as alternates, so collapse them onto the canonical URL. Real query
  // strings (`?utm_source=…`) carry values and pass through untouched.
  if (isBareFlagHomepageRequest(request)) {
    const url = request.nextUrl.clone();
    url.search = "";
    return NextResponse.redirect(url, 301);
  }

  // Reject explicit cross-site state-changing requests before auth refresh or
  // guest-cookie creation. Requests without an Origin header are kept
  // compatible with signed webhooks and non-browser clients.
  if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
    const requestOrigin = request.headers.get("origin");
    if (requestOrigin && requestOrigin !== request.nextUrl.origin) {
      return new NextResponse("Cross-site submissions are not allowed.", { status: 403 });
    }
  }

  if (request.nextUrl.pathname === "/quick-order/add") {
    return NextResponse.next();
  }
  const current = request.cookies.get(GUEST_SESSION_COOKIE)?.value;

  const newSession = !isGuestSessionId(current) ? crypto.randomUUID() : null;
  if (newSession) request.cookies.set(GUEST_SESSION_COOKIE, newSession);
  const response = await refreshSupabaseSession(request);
  if (newSession) {
    response.cookies.set({
      name: GUEST_SESSION_COOKIE,
      value: newSession,
      ...guestSessionCookieOptions(),
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
