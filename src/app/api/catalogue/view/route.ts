import { NextResponse } from "next/server";
import { recordProductOpen } from "@/features/catalogue/trending";
import { validateProductViewPayload } from "@/features/catalogue/view-route";

export async function POST(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  try {
    const body = await request.json() as { productId?: unknown; fingerprint?: unknown };
    const payload = validateProductViewPayload(body);
    if (!payload) {
      return NextResponse.json({ ok: false }, { status: 400, headers });
    }
    const { productId, fingerprint } = payload;
    // The insert's foreign key is the source of truth. Avoid a second round
    // trip for an analytics event; this endpoint is deliberately non-critical.
    await recordProductOpen({ productId, fingerprint });
    return NextResponse.json({ ok: true }, { status: 202, headers });
  } catch {
    // Analytics are non-blocking and should never make product rendering fail.
    return NextResponse.json({ ok: false }, { status: 202, headers });
  }
}
