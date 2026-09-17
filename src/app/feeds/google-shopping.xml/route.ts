import { getProductBySlug, listProductCards } from "@/features/catalogue";
import { renderGoogleShoppingFeed } from "@/features/catalogue/google-shopping-feed";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 3600;
export const dynamic = "force-dynamic";

export async function GET() {
  const cards = await listProductCards();
  const details = await Promise.all(cards.map((card) => getProductBySlug(card.slug)));
  const entries = cards.flatMap((card, index) => {
    const product = details[index];
    if (!product) return [];
    return [{
      id: product.sku,
      title: product.specLine && product.specLine !== product.name ? `${product.name} — ${product.specLine}` : product.name,
      description: product.description || `${product.name} from ${product.brandName}, available through PaperSource Ghana.`,
      link: absoluteUrl(`/product/${product.slug}`),
      imageLink: product.imageSrc,
      availability: product.stock === "out" ? "out of stock" as const : "in stock" as const,
      pricePesewas: product.unitPricePesewas,
      brand: product.brandName,
      productType: product.categoryName,
      gtin: product.barcode,
    }];
  });

  return new Response(renderGoogleShoppingFeed(entries), {
    headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
