import { NextResponse } from "next/server";
import { z } from "zod";
import {
  declineQuote,
  parseLinePrices,
  parseOptionalDeliveryFee,
  QuoteAdminError,
  saveQuotePrices,
  sendQuote,
  startQuoteReview,
} from "@/features/quotations/admin";
import { canAccessAdmin } from "@/lib/staff/rbac";
import { readStaffActor } from "@/lib/staff/require";

const quoteIdSchema = z.string().uuid();

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  const formData = await request.formData();
  const quoteId = quoteIdSchema.parse(formData.get("quoteId"));
  const intent = String(formData.get("intent") ?? "");
  const detail = new URL(`/admin/quotes/${quoteId}`, origin);

  const actor = await readStaffActor();
  if (!actor || !canAccessAdmin(actor.role, "quotes", "write")) {
    return NextResponse.redirect(new URL("/admin/login", origin), 303);
  }

  try {
    if (intent === "start-review") {
      await startQuoteReview({
        role: actor.role,
        actorId: actor.profileId,
        quoteId,
      });
    } else if (intent === "save-prices") {
      await saveQuotePrices({
        role: actor.role,
        actorId: actor.profileId,
        quoteId,
        linePrices: parseLinePrices(formData),
        deliveryFeePesewas: parseOptionalDeliveryFee(formData),
      });
    } else if (intent === "send") {
      await sendQuote({
        role: actor.role,
        actorId: actor.profileId,
        quoteId,
      });
    } else if (intent === "decline") {
      await declineQuote({
        role: actor.role,
        actorId: actor.profileId,
        quoteId,
      });
    } else {
      detail.searchParams.set("error", "Unknown quote action.");
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
