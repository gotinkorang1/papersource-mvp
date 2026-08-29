import { NextResponse } from "next/server";
import { z } from "zod";
import { QuoteAcceptError } from "@/features/quotations/accept";
import { declineQuoteByToken } from "@/features/quotations/cancel";

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  const formData = await request.formData();
  const token = z.string().uuid().parse(formData.get("token"));
  const quoteUrl = new URL(`/quote/${token}`, origin);

  try {
    await declineQuoteByToken(token);
    quoteUrl.searchParams.set("notice", "declined");
    return NextResponse.redirect(quoteUrl, 303);
  } catch (error) {
    quoteUrl.searchParams.set(
      "error",
      error instanceof QuoteAcceptError
        ? error.message
        : "Could not decline this quotation.",
    );
    return NextResponse.redirect(quoteUrl, 303);
  }
}
