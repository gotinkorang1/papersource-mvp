import { readCommerceIdentity } from "@/lib/customer/commerce";
import { NextResponse } from "next/server";
import { z } from "zod";
import { acceptQuoteByToken, QuoteAcceptError } from "@/features/quotations/accept";

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  if (request.headers.get("origin") !== origin) return new NextResponse("Cross-site submissions are not allowed.", { status: 403 });
  const formData = await request.formData();
  const token = z.string().uuid().parse(formData.get("token"));
  const identity = await readCommerceIdentity(true);

  try {
    const result = await acceptQuoteByToken({ token, ...identity });
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
