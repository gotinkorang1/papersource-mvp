import { and, eq, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";
import { recordProductOpen } from "@/features/catalogue/trending";
import { getDb } from "@/lib/db/client";
import { products } from "@/lib/db/schema";
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
    const [product] = await getDb().select({ id: products.id }).from(products).where(and(eq(products.id, productId), isNull(products.deletedAt))).limit(1);
    if (!product) return NextResponse.json({ ok: false }, { status: 404, headers });
    await recordProductOpen({ productId, fingerprint });
    return NextResponse.json({ ok: true }, { status: 202, headers });
  } catch {
    // Analytics are non-blocking and should never make product rendering fail.
    return NextResponse.json({ ok: false }, { status: 202, headers });
  }
}
