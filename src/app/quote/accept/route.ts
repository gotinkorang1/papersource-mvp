import { NextResponse } from "next/server";
import { z } from "zod";
import { acceptQuoteByToken, QuoteAcceptError } from "@/features/quotations/accept";
import { readGuestSessionId } from "@/lib/session/guest";

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  const formData = await request.formData();
  const token = z.string().uuid().parse(formData.get("token"));
  const sessionId = await readGuestSessionId();

  try {
    const result = await acceptQuoteByToken({ token, sessionId });
    return NextResponse.redirect(new URL(`/order/${result.orderNumber}`, origin), 303);
  } catch (error) {
    const quoteUrl = new URL(`/quote/${token}`, origin);
    quoteUrl.searchParams.set(
      "error",
      error instanceof QuoteAcceptError ? error.message : "Could not accept this quotation.",
    );
    return NextResponse.redirect(quoteUrl, 303);
  }
}
