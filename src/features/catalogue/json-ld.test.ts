import { pesewasToMajor } from "@/lib/money";
import type { ProductDetailModel } from "@/types/catalogue";
import { describe, expect, it } from "vitest";
import { productJsonLd } from "./json-ld";

const product = {
  name: "Double A Premium A4 Paper",
  description: "80gsm A4",
  sku: "DA-A4-80-500",
  brandName: "Double A",
  stock: "in_stock",
  unitPricePesewas: 7800,
} as ProductDetailModel;

describe("productJsonLd", () => {
  it("omits image until a real product image URL exists", () => {
    const json = productJsonLd(product, "http://localhost:3000/product/double-a-premium-a4");
    expect(json).not.toHaveProperty("image");
    expect(json.offers.price).toBe(pesewasToMajor(7800));
  });

  it("includes aggregate ratings only for approved reviews", () => {
    const json = productJsonLd(product, "http://localhost:3000/product/double-a-premium-a4", [{ rating: 5 }, { rating: 4 }]);
    expect(json.aggregateRating).toEqual(expect.objectContaining({ ratingValue: "4.5", reviewCount: 2 }));
    expect(productJsonLd(product, "http://localhost:3000/product/double-a-premium-a4").aggregateRating).toBeUndefined();
  });

  it("publishes individual approved reviews when complete review copy exists", () => {
    const json = productJsonLd(product, "http://localhost:3000/product/double-a-premium-a4", [{
      rating: 5,
      title: "Excellent quality",
      body: "The paper feeds cleanly and arrives well packed.",
      displayName: "Ama M.",
      createdAt: "2026-09-18T10:00:00.000Z",
    }]);
    expect(json.review).toEqual([expect.objectContaining({
      "@type": "Review",
      name: "Excellent quality",
      reviewBody: "The paper feeds cleanly and arrives well packed.",
      author: { "@type": "Person", name: "Ama M." },
      datePublished: "2026-09-18T10:00:00.000Z",
    })]);
  });

  it("includes image when Cloudinary (or other) URL is present", () => {
    const json = productJsonLd(
      { ...product, imageSrc: "https://res.cloudinary.com/demo/image.jpg" },
      "http://localhost:3000/product/double-a-premium-a4",
    );
    expect(json).toHaveProperty("image", "https://res.cloudinary.com/demo/image.jpg");
  });

  it("publishes every product image for rich search previews", () => {
    const json = productJsonLd(
      { ...product, imageSources: [{ src: "https://example.com/one.jpg", alt: "Front" }, { src: "https://example.com/two.jpg", alt: "Back" }] },
      "http://localhost:3000/product/double-a-premium-a4",
    );
    expect(json).toHaveProperty("image", ["https://example.com/one.jpg", "https://example.com/two.jpg"]);
  });

  it("links the Product entity to its canonical product page", () => {
    const canonical = "http://localhost:3000/product/double-a-premium-a4";
    const json = productJsonLd(product, canonical);

    expect(json.mainEntityOfPage).toEqual({ "@type": "WebPage", "@id": canonical });
    expect(json.inLanguage).toBe("en-GH");
  });

  it("includes category, seller and a valid barcode as structured product data", () => {
    const json = productJsonLd(
      { ...product, categoryName: "Copier Paper", barcode: "123456789012" },
      "http://localhost:3000/product/double-a-premium-a4",
    );
    expect(json.category).toBe("Copier Paper");
    expect(json.gtin).toBe("123456789012");
    expect(json.offers.seller).toEqual({ "@id": "http://localhost:3000/#organization", "@type": "Organization", name: "PaperSource Ghana" });
  });

  it("publishes Ghana shipping and return policy references on the offer", () => {
    const json = productJsonLd(product, "http://localhost:3000/product/double-a-premium-a4");

    expect(json.offers.shippingDetails).toEqual({
      "@type": "OfferShippingDetails",
      shippingDestination: { "@type": "DefinedRegion", addressCountry: "GH" },
      hasShippingService: { "@id": "http://localhost:3000/#shipping-service" },
    });
    expect(json.offers.hasMerchantReturnPolicy).toEqual({ "@id": "http://localhost:3000/#return-policy" });
  });

  it("adds Book signals only when book attributes exist", () => {
    const json = productJsonLd(
      { ...product, attributes: [{ namespace: "book", key: "author", valueText: "Ama Mensah" }, { namespace: "book", key: "isbn", valueText: "9781234567890" }, { namespace: "book", key: "publisher", valueText: "Example Press" }] },
      "http://localhost:3000/product/reading-book",
    );
    expect(json["@type"]).toEqual(["Product", "Book"]);
    expect(json.author).toEqual({ "@type": "Person", name: "Ama Mensah" });
    expect(json.isbn).toBe("9781234567890");
    expect(json.publisher).toEqual({ "@type": "Organization", name: "Example Press" });
    expect(productJsonLd({ ...product, attributes: [{ namespace: "paper", key: "gsm", valueText: "80gsm" }] }, "http://localhost:3000/product/paper")["@type"]).toBe("Product");
  });

  it("publishes a useful fallback description when catalogue copy is empty", () => {
    const json = productJsonLd(
      { ...product, description: "   ", categoryName: "Copier Paper" },
      "http://localhost:3000/product/double-a-premium-a4",
    );
    expect(json.description).toBe("Double A Premium A4 Paper by Double A. Shop Copier Paper from PaperSource Ghana.");
  });
});
