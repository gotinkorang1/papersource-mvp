import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { profiles } from "@/lib/db/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { readStaffActor } from "@/lib/staff/require";
import { recordAdminAudit } from "@/features/admin/audit";
import { captureServerException } from "@/lib/observability/sentry";

const nameSchema = z.string().trim().min(2, "Enter your full name.").max(120);
const phoneSchema = z.string().trim().max(30).optional().default("");
const passwordSchema = z.object({ password: z.string().min(12, "Use at least 12 characters.").max(128), confirmPassword: z.string().max(128) }).refine((value) => value.password === value.confirmPassword, { path: ["confirmPassword"], message: "Passwords must match." });

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  const destination = new URL("/admin/profile", origin);
  const actor = await readStaffActor();
  if (!actor) return NextResponse.redirect(new URL("/admin/login", origin), 303);
  try {
    const formData = await request.formData();
    const intent = formData.get("intent");
    const supabase = await createSupabaseServerClient();
    if (intent === "password") {
      const parsed = passwordSchema.safeParse({ password: formData.get("password"), confirmPassword: formData.get("confirmPassword") });
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Check your password.");
      const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
      if (error) throw new Error("Could not update your password. Try again.");
      await recordAdminAudit({ actorProfileId: actor.profileId, action: "staff_password_updated", resourceType: "profile", resourceId: actor.profileId });
      destination.searchParams.set("success", "password");
    } else {
      const fullName = nameSchema.parse(formData.get("fullName"));
      const phone = phoneSchema.parse(formData.get("phone"));
      const { error } = await supabase.auth.updateUser({ data: { full_name: fullName, phone } });
      if (error) throw new Error("Could not update your profile. Try again.");
      await getDb().update(profiles).set({ fullName, phone: phone || null, updatedAt: new Date() }).where(eq(profiles.id, actor.profileId));
      await recordAdminAudit({ actorProfileId: actor.profileId, action: "staff_profile_updated", resourceType: "profile", resourceId: actor.profileId });
      destination.searchParams.set("success", "profile");
    }
  } catch (error) {
    if (!(error instanceof Error && [
      "Enter your full name.",
      "Use at least 12 characters.",
      "Passwords must match.",
      "Could not update your password. Try again.",
      "Could not update your profile. Try again.",
    ].includes(error.message))) {
      captureServerException(error, { operation: "staff_profile_mutation", dependency: "supabase" });
    }
    const message = error instanceof Error && [
      "Enter your full name.",
      "Use at least 12 characters.",
      "Passwords must match.",
      "Could not update your password. Try again.",
      "Could not update your profile. Try again.",
    ].includes(error.message)
      ? error.message
      : "Unable to update your account. Please check the fields and try again.";
    destination.searchParams.set("error", message);
  }
  return NextResponse.redirect(destination, 303);
}
