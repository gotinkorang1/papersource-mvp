import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { refreshSupabaseSession } from "@/lib/supabase/proxy";
import {
  GUEST_SESSION_COOKIE,
  guestSessionCookieOptions,
  isGuestSessionId,
} from "@/lib/session/constants";

export async function proxy(request: NextRequest) {
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
