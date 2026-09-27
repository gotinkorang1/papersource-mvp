import { getProductBySlug, listProductCards } from "@/features/catalogue";
import { renderGoogleShoppingFeed, shoppingFeedTitle } from "@/features/catalogue/google-shopping-feed";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 3600;
export const dynamic = "force-dynamic";

export async function GET() {
  const cards = await listProductCards();
  const details = await Promise.all(cards.map((card) => getProductBySlug(card.slug)));
  const entries = cards.flatMap((card, index) => {
    const product = details[index];
    if (!product) return [];
    const bookAttributes = product.attributes.filter((attribute) => attribute.namespace === "book" || attribute.namespace === "bibliographic");
    const author = bookAttributes.find((attribute) => attribute.key === "author")?.valueText;
    const format = bookAttributes.find((attribute) => attribute.key === "format")?.valueText;
    const isbn = bookAttributes.find((attribute) => attribute.key === "isbn")?.valueText.replace(/[-\s]/g, "");
    const validIsbn = isbn && /^(?:\d{8}|\d{12,14})$/.test(isbn) ? isbn : undefined;
    return [{
      id: product.sku,
      title: shoppingFeedTitle({ name: product.name, author, specification: format || (product.specLine !== product.name ? product.specLine : undefined) }),
      description: product.description || `${product.name} from ${product.brandName}, available through PaperSource Ghana.`,
      link: absoluteUrl(`/product/${product.slug}`),
      imageLink: product.imageSrc,
      additionalImageLinks: product.imageSources?.slice(1).map((image) => image.src),
      availability: product.stock === "out" ? "out of stock" as const : "in stock" as const,
      pricePesewas: product.unitPricePesewas,
      brand: product.brandName,
      productType: product.categoryName,
      gtin: product.barcode || validIsbn,
    }];
  });

  return new Response(renderGoogleShoppingFeed(entries), {
    headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
