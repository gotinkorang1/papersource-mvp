import { readCommerceIdentity } from "@/lib/customer/commerce";
import { NextResponse } from "next/server";
import { z } from "zod";
import { QuoteAcceptError } from "@/features/quotations/accept";
import { declineQuoteByToken } from "@/features/quotations/cancel";

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  if (request.headers.get("origin") !== origin) return new NextResponse("Cross-site submissions are not allowed.", { status: 403 });
  const formData = await request.formData();
  const token = z.string().uuid().parse(formData.get("token"));
  const quoteUrl = new URL(`/quote/${token}`, origin);

  try {
    await declineQuoteByToken(token, await readCommerceIdentity());
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
