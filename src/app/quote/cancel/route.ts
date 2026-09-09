import { readCommerceIdentity } from "@/lib/customer/commerce";
import { NextResponse } from "next/server";
import { z } from "zod";
import { QuoteAcceptError } from "@/features/quotations/accept";
import { cancelQuoteByToken } from "@/features/quotations/cancel";

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  if (request.headers.get("origin") !== origin) return new NextResponse("Cross-site submissions are not allowed.", { status: 403 });
  const formData = await request.formData();
  const parsedToken = z.string().uuid().safeParse(formData.get("token"));
  if (!parsedToken.success) return new NextResponse("Invalid quotation link.", { status: 400 });
  const token = parsedToken.data;
  const quoteUrl = new URL(`/quote/${token}`, origin);

  try {
    await cancelQuoteByToken(token, await readCommerceIdentity());
    quoteUrl.searchParams.set("notice", "cancelled");
    return NextResponse.redirect(quoteUrl, 303);
  } catch (error) {
    quoteUrl.searchParams.set(
      "error",
      error instanceof QuoteAcceptError
        ? error.message
        : "Could not cancel this quotation.",
    );
    return NextResponse.redirect(quoteUrl, 303);
  }
}
