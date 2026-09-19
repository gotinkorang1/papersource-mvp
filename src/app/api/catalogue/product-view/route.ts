import { NextResponse } from "next/server";
import { recordProductOpen } from "@/features/catalogue/trending";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  try {
    const body = await request.json() as { productId?: unknown; fingerprint?: unknown };
    const productId = typeof body.productId === "string" ? body.productId.trim() : "";
    const fingerprint = typeof body.fingerprint === "string" ? body.fingerprint.trim() : "";
    if (!UUID_RE.test(productId) || fingerprint.length < 16 || fingerprint.length > 128) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    await recordProductOpen({ productId, fingerprint });
    return NextResponse.json({ ok: true }, { status: 202 });
  } catch {
    // Analytics must never make a product page fail.
    return NextResponse.json({ ok: false }, { status: 202 });
  }
}
