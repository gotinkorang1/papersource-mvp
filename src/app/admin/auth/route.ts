import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateStaff, StaffAuthError } from "@/features/staff/login";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  const loginUrl = new URL("/admin/login", origin);

  try {
    const formData = await request.formData();
    const parsed = loginSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });
    await authenticateStaff(parsed);
    const response = NextResponse.redirect(new URL("/admin", origin), 303);
    return response;
  } catch (error) {
    if (error instanceof StaffAuthError || error instanceof z.ZodError) {
      loginUrl.searchParams.set("error", "That staff sign-in is not valid.");
      return NextResponse.redirect(loginUrl, 303);
    }
    throw error;
  }
}
