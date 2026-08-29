import { NextResponse } from "next/server";
import {
  STAFF_SESSION_COOKIE,
  staffSessionCookieOptions,
} from "@/lib/staff/constants";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/admin/login", request.url), 303);
  response.cookies.set(STAFF_SESSION_COOKIE, "", {
    ...staffSessionCookieOptions(),
    maxAge: 0,
  });
  return response;
}
