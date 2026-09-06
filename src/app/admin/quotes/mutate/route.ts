import { NextResponse } from "next/server";
import { z } from "zod";
import { recordAdminAudit } from "@/features/admin/audit";
import {
  declineQuote,
  parseLinePrices,
  parseOptionalDeliveryFee,
  QuoteAdminError,
  reviseQuote,
  saveQuotePrices,
  sendQuote,
  startQuoteReview,
} from "@/features/quotations/admin";
import { confirmQuoteTerms } from "@/features/quotations/terms";
import { canAccessAdmin, canConfirmQuoteTerms } from "@/lib/staff/rbac";
import { readStaffActor } from "@/lib/staff/require";

const quoteIdSchema = z.string().uuid();

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  const formData = await request.formData();
  const quoteId = quoteIdSchema.parse(formData.get("quoteId"));
  const intent = String(formData.get("intent") ?? "");
  let detail = new URL(`/admin/quotes/${quoteId}`, origin);
  let auditAction: string | null = null;
  let auditResourceId = quoteId;
  let auditMetadata: Record<string, unknown> | undefined;

  const actor = await readStaffActor();
  if (!actor) {
    return NextResponse.redirect(new URL("/admin/login", origin), 303);
  }

  const termsIntent = intent === "confirm-terms";
  const allowed = termsIntent
    ? canConfirmQuoteTerms(actor.role)
    : canAccessAdmin(actor.role, "quotes", "write");
  if (!allowed) {
    return NextResponse.redirect(new URL("/admin/login", origin), 303);
  }

  try {
    if (intent === "start-review") {
      await startQuoteReview({
        role: actor.role,
        actorId: actor.profileId,
        quoteId,
      });
      auditAction = "quote_review_started";
    } else if (intent === "save-prices") {
      await saveQuotePrices({
        role: actor.role,
        actorId: actor.profileId,
        quoteId,
        linePrices: parseLinePrices(formData),
        deliveryFeePesewas: parseOptionalDeliveryFee(formData),
      });
      auditAction = "quote_prices_saved";
    } else if (intent === "send") {
      await sendQuote({
        role: actor.role,
        actorId: actor.profileId,
        quoteId,
      });
      auditAction = "quote_sent";
    } else if (intent === "decline") {
      await declineQuote({
        role: actor.role,
        actorId: actor.profileId,
        quoteId,
      });
      auditAction = "quote_declined";
    } else if (intent === "revise") {
      const revised = await reviseQuote({
        role: actor.role,
        actorId: actor.profileId,
        quoteId,
      });
      detail = new URL(`/admin/quotes/${revised.quoteId}`, origin);
      auditAction = "quote_revised";
      auditResourceId = revised.quoteId;
    } else if (intent === "confirm-terms") {
      const provider = String(formData.get("provider") ?? "");
      await confirmQuoteTerms({
        role: actor.role,
        actorId: actor.profileId,
        quoteId,
        provider,
        note: String(formData.get("note") ?? ""),
      });
      auditAction = "quote_terms_confirmed";
      auditMetadata = { provider };
    } else {
      detail.searchParams.set("error", "Unknown quote action.");
    }
    if (auditAction) {
      await recordAdminAudit({
        actorProfileId: actor.profileId,
        action: auditAction,
        resourceType: "quote",
        resourceId: auditResourceId,
        metadata: auditMetadata,
      });
    }
  } catch (error) {
    const message =
      error instanceof QuoteAdminError || error instanceof Error
        ? error.message
        : "Could not update this quotation.";
    detail.searchParams.set("error", message);
  }

  return NextResponse.redirect(detail, 303);
}
