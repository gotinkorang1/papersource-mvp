import { pesewasToMajor } from "@/lib/money";
import type { ProductDetailModel } from "@/types/catalogue";

export function productJsonLd(product: ProductDetailModel, canonical: string) {
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
    image: canonical,
    brand: {
      "@type": "Brand",
      name: product.brandName,
    },
    offers: {
      "@type": "Offer",
      url: canonical,
      priceCurrency: "GHS",
      price: pesewasToMajor(product.unitPricePesewas),
      availability,
      itemCondition: "https://schema.org/NewCondition",
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
