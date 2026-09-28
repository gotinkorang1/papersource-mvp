import { pesewasToMajor } from "@/lib/money";
import type { ProductDetailModel } from "@/types/catalogue";
import { productSeoDescription } from "./product-metadata";

export function productJsonLd(
  product: ProductDetailModel,
  canonical: string,
  reviews: {
    rating: number;
    title?: string | null;
    body?: string;
    displayName?: string;
    createdAt?: Date | string;
  }[] = [],
) {
  const origin = new URL(canonical).origin;
  const attributes = product.attributes ?? [];
  // Imported catalogue records use the bibliographic namespace, while
  // manually managed books may use book. Treat both as book metadata so
  // author, ISBN and publisher are not lost from structured data.
  const bookAttributes = attributes.filter((attribute) => attribute.namespace === "book" || attribute.namespace === "bibliographic");
  const bookAuthor = bookAttributes.find((attribute) => attribute.key === "author")?.valueText.trim();
  const bookIsbn = bookAttributes.find((attribute) => attribute.key === "isbn")?.valueText.trim();
  const bookPublisher = bookAttributes.find((attribute) => attribute.key === "publisher")?.valueText.trim();
  const validIsbn = bookIsbn && /^(?:\d{9}[\dX]|\d{13})$/.test(bookIsbn.replace(/[-\s]/g, "")) ? bookIsbn.replace(/[-\s]/g, "") : null;
  const isBook = Boolean(bookAuthor || validIsbn || bookPublisher || bookAttributes.length);
  const description = productSeoDescription(product);
  const reviewEntities = reviews
    .filter((review) => Boolean(review.displayName?.trim() && review.body?.trim()))
    .map((review) => ({
      "@type": "Review",
      ...(review.title?.trim() ? { name: review.title.trim() } : {}),
      reviewBody: review.body!.trim(),
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1,
      },
      author: { "@type": "Person", name: review.displayName!.trim() },
      ...(review.createdAt ? { datePublished: new Date(review.createdAt).toISOString() } : {}),
    }));
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
    ...((product.barcode && /^(?:\d{8}|\d{12,14})$/.test(product.barcode))
      ? { gtin: product.barcode }
      : validIsbn
        ? { gtin: validIsbn }
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
    ...(reviewEntities.length ? { review: reviewEntities } : {}),
    offers: {
      "@type": "Offer",
      url: canonical,
      priceCurrency: "GHS",
      price: pesewasToMajor(product.unitPricePesewas),
      availability,
      itemCondition: "https://schema.org/NewCondition",
      // Reference the global policy instead of inventing one nationwide rate.
      // The live checkout calculates Accra/Tema fees and confirms nationwide
      // delivery on request; Google supports this relationship through
      // OfferShippingDetails.hasShippingService.
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "GH",
        },
        // The storefront promise for standard Accra/Tema delivery is 1–2
        // business days. Keep this bounded estimate in structured data rather
        // than inventing a single nationwide shipping price; checkout still
        // calculates the exact zone fee server-side.
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 1,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 2,
            unitCode: "DAY",
          },
        },
        hasShippingService: { "@id": `${origin}/#shipping-service` },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        "@id": `${origin}/#return-policy`,
        applicableCountry: "GH",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 7,
        merchantReturnLink: `${origin}/returns`,
        url: `${origin}/returns`,
      },
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
    "@id": `${origin}${items.at(-1)?.href ?? "/"}#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${origin}${item.href}`,
    })),
  };
}
