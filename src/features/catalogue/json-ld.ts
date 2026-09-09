import { pesewasToMajor } from "@/lib/money";
import type { ProductDetailModel } from "@/types/catalogue";

export function productJsonLd(
  product: ProductDetailModel,
  canonical: string,
  reviews: { rating: number }[] = [],
) {
  const availability =
    product.stock === "out"
      ? "https://schema.org/OutOfStock"
      : product.stock === "low"
        ? "https://schema.org/LimitedAvailability"
        : "https://schema.org/InStock";

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.sku,
    ...(product.imageSources?.length
      ? { image: product.imageSources.map((image) => image.src) }
      : product.imageSrc
        ? { image: product.imageSrc }
        : {}),
    brand: {
      "@type": "Brand",
      name: product.brandName,
    },
    category: product.categoryName,
    ...(product.barcode && /^(?:\d{8}|\d{12,14})$/.test(product.barcode)
      ? { gtin: product.barcode }
      : {}),
    ...(reviews.length
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1),
            reviewCount: reviews.length,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    offers: {
      "@type": "Offer",
      url: canonical,
      priceCurrency: "GHS",
      price: pesewasToMajor(product.unitPricePesewas),
      availability,
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: "PaperSource" },
    },
  };
}

export function breadcrumbJsonLd(
  items: { name: string; href: string }[],
  origin: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${origin}${item.href}`,
    })),
  };
}
