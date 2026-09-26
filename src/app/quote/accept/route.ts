import { readCommerceIdentity } from "@/lib/customer/commerce";
import { NextResponse } from "next/server";
import { z } from "zod";
import { acceptQuoteByToken, QuoteAcceptError } from "@/features/quotations/accept";
import { GUEST_SESSION_COOKIE } from "@/lib/session/guest";
import { guestSessionCookieOptions } from "@/lib/session/constants";
import { captureServerException } from "@/lib/observability/sentry";

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  if (request.headers.get("origin") !== origin) return new NextResponse("Cross-site submissions are not allowed.", { status: 403 });
  const formData = await request.formData();
  const parsedToken = z.string().uuid().safeParse(formData.get("token"));
  if (!parsedToken.success) return new NextResponse("Invalid quotation link.", { status: 400 });
  const token = parsedToken.data;
  const identity = await readCommerceIdentity(true);

  try {
    const result = await acceptQuoteByToken({ token, ...identity });
    const response = NextResponse.redirect(new URL(`/order/${result.orderNumber}`, origin), 303);
    // Preserve the guest identity used to create the order across the redirect.
    // This keeps the order owner check working without exposing document numbers
    // as credentials.
    if (identity.sessionId) {
      response.cookies.set(GUEST_SESSION_COOKIE, identity.sessionId, guestSessionCookieOptions());
    }
    return response;
  } catch (error) {
    if (!(error instanceof QuoteAcceptError)) {
      captureServerException(error, { operation: "accept_quote", dependency: "database" });
    }
    const quoteUrl = new URL(`/quote/${token}`, origin);
    quoteUrl.searchParams.set(
      "error",
      error instanceof QuoteAcceptError ? error.message : "Could not accept this quotation.",
    );
    return NextResponse.redirect(quoteUrl, 303);
  }
}
