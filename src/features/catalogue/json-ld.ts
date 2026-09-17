import { pesewasToMajor } from "@/lib/money";
import type { ProductDetailModel } from "@/types/catalogue";
import { productSeoDescription } from "./product-metadata";

export function productJsonLd(
  product: ProductDetailModel,
  canonical: string,
  reviews: { rating: number }[] = [],
) {
  const origin = new URL(canonical).origin;
  const attributes = product.attributes ?? [];
  const bookAuthor = attributes.find((attribute) => attribute.namespace === "book" && attribute.key === "author")?.valueText.trim();
  const bookIsbn = attributes.find((attribute) => attribute.namespace === "book" && attribute.key === "isbn")?.valueText.trim();
  const bookPublisher = attributes.find((attribute) => attribute.namespace === "book" && attribute.key === "publisher")?.valueText.trim();
  const validIsbn = bookIsbn && /^(?:\d{9}[\dX]|\d{13})$/.test(bookIsbn.replace(/[-\s]/g, "")) ? bookIsbn.replace(/[-\s]/g, "") : null;
  const isBook = Boolean(bookAuthor || validIsbn || bookPublisher || attributes.some((attribute) => attribute.namespace === "book"));
  const description = productSeoDescription(product);
  const availability =
    product.stock === "out"
      ? "https://schema.org/OutOfStock"
      : product.stock === "low"
        ? "https://schema.org/LimitedAvailability"
        : "https://schema.org/InStock";

  return {
    "@context": "https://schema.org",
    "@type": isBook ? ["Product", "Book"] : "Product",
    "@id": `${canonical}#product`,
    name: product.name,
    description,
    url: canonical,
    inLanguage: "en-GH",
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
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
    ...(attributes.length
      ? {
          additionalProperty: attributes.map((attribute) => ({
            "@type": "PropertyValue",
            name: attribute.key.replace(/[_-]+/g, " "),
            value: attribute.valueText,
          })),
        }
      : {}),
    ...(bookAuthor ? { author: { "@type": "Person", name: bookAuthor } } : {}),
    ...(validIsbn ? { isbn: validIsbn } : {}),
    ...(bookPublisher ? { publisher: { "@type": "Organization", name: bookPublisher } } : {}),
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
      seller: { "@id": `${origin}/#organization`, "@type": "Organization", name: "PaperSource Ghana" },
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
