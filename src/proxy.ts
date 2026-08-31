import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  GUEST_SESSION_COOKIE,
  guestSessionCookieOptions,
  isGuestSessionId,
} from "@/lib/session/constants";

export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  // This handler validates Origin before creating its own guest cookie.
  if (request.nextUrl.pathname === "/quick-order/add") {
    return response;
  }
  const current = request.cookies.get(GUEST_SESSION_COOKIE)?.value;

  if (!isGuestSessionId(current)) {
    response.cookies.set({
      name: GUEST_SESSION_COOKIE,
      value: crypto.randomUUID(),
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
