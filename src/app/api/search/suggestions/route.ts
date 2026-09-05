import { NextResponse } from "next/server";
import { listProductCards } from "@/features/catalogue";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (query.length < 2) return NextResponse.json({ suggestions: [] });

  try {
    const products = await listProductCards({ query });
    return NextResponse.json({
      suggestions: products.slice(0, 7).map(({ slug, name, sku, specLine }) => ({ slug, name, sku, specLine })),
    }, { headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=120" } });
  } catch {
    return NextResponse.json({ suggestions: [] }, { status: 200 });
  }
}
