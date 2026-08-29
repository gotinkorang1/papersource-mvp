import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateStaff, StaffAuthError } from "@/features/staff/login";
import {
  STAFF_SESSION_COOKIE,
  staffSessionCookieOptions,
} from "@/lib/staff/constants";
import { signStaffCookie } from "@/lib/staff/session";

const loginSchema = z.object({
  email: z.string().email(),
  secret: z.string().min(1),
});

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  const loginUrl = new URL("/admin/login", origin);

  try {
    const formData = await request.formData();
    const parsed = loginSchema.parse({
      email: formData.get("email"),
      secret: formData.get("secret"),
    });
    const staff = await authenticateStaff(parsed);
    const response = NextResponse.redirect(new URL("/admin", origin), 303);
    response.cookies.set(
      STAFF_SESSION_COOKIE,
      signStaffCookie(staff.profileId),
      staffSessionCookieOptions(),
    );
    return response;
  } catch (error) {
    if (error instanceof StaffAuthError || error instanceof z.ZodError) {
      loginUrl.searchParams.set("error", "That staff sign-in is not valid.");
      return NextResponse.redirect(loginUrl, 303);
    }
    throw error;
  }
}
