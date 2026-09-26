import { NextResponse } from "next/server";
import { recordAdminAudit } from "@/features/admin/audit";
import { saveFaq } from "@/features/content/admin";
import { readStaffActor } from "@/lib/staff/require";
export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  const next = new URL("/admin/faqs", origin);
  const actor = await readStaffActor();
  if (!actor) return NextResponse.redirect(new URL("/admin/login", origin), 303);
  try {
    const form = await request.formData();
    const id = String(form.get("id") || "") || undefined;
    await saveFaq(actor.role, id, {
      question: String(form.get("question") || ""),
      answer: String(form.get("answer") || ""),
      position: String(form.get("position") || "0"),
      status: String(form.get("status") || "draft"),
    });
    await recordAdminAudit({ actorProfileId: actor.profileId, action: id ? "faq_updated" : "faq_created", resourceType: "faq", resourceId: id });
  } catch {
    next.searchParams.set("error", "Could not save FAQ. Please check the fields and try again.");
  }
  return NextResponse.redirect(next, 303);
}
