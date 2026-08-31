import { NextResponse } from "next/server";
import { applyQuickOrderLines } from "@/features/quotations/apply-quick-order";
import { parseQuickOrderForm } from "@/features/quotations/quick-order";
import {
  GUEST_SESSION_COOKIE,
  guestSessionCookieOptions,
} from "@/lib/session/constants";
import { readGuestSessionId } from "@/lib/session/guest";

function withSessionCookie(response: NextResponse, sessionId: string, created: boolean) {
  if (created) {
    response.cookies.set(GUEST_SESSION_COOKIE, sessionId, guestSessionCookieOptions());
  }
  return response;
}

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  if (request.headers.get("origin") !== origin) {
    return new NextResponse("Cross-site submissions are not allowed.", { status: 403 });
  }
  const formData = await request.formData();
  const destination =
    String(formData.get("destination") ?? "quote") === "cart" ? "cart" : "quote";
  const next = new URL(destination === "cart" ? "/cart" : "/quote", origin);
  const parsed = parseQuickOrderForm(formData);

  const existing = await readGuestSessionId();
  const sessionId = existing ?? crypto.randomUUID();
  const created = !existing;

  if (parsed.rows.length === 0 && parsed.invalid.length === 0) {
    const back = new URL("/quick-order", origin);
    back.searchParams.set("error", "Enter at least one SKU and quantity.");
    return withSessionCookie(NextResponse.redirect(back, 303), sessionId, created);
  }

  const result = await applyQuickOrderLines({
    sessionId,
    destination,
    rows: parsed.rows,
  });

  if (result.added === 0) {
    const back = new URL("/quick-order", origin);
    const problems = [
      ...parsed.invalid,
      ...result.unknown.map((sku) => `${sku} is not a live catalogue SKU.`),
      ...result.cartBlocked.map(
        (sku) => `${sku} is request-quote at that quantity — add it to the quote list.`,
      ),
    ];
    back.searchParams.set(
      "error",
      problems[0] ?? "None of those lines could be added.",
    );
    return withSessionCookie(NextResponse.redirect(back, 303), sessionId, created);
  }

  if (parsed.invalid.length) {
    next.searchParams.set("notice", parsed.invalid[0] ?? "");
  }
  if (result.unknown.length) {
    next.searchParams.set("unknown", result.unknown.join(", "));
  }
  if (result.cartBlocked.length) {
    next.searchParams.set("quoteOnly", result.cartBlocked.join(", "));
  }
  next.searchParams.set("added", String(result.added));
  return withSessionCookie(NextResponse.redirect(next, 303), sessionId, created);
}
