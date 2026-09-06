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

  it("includes image when Cloudinary (or other) URL is present", () => {
    const json = productJsonLd(
      { ...product, imageSrc: "https://res.cloudinary.com/demo/image.jpg" },
      "http://localhost:3000/product/double-a-premium-a4",
    );
    expect(json.image).toBe("https://res.cloudinary.com/demo/image.jpg");
  });

  it("includes category, seller and a valid barcode as structured product data", () => {
    const json = productJsonLd(
      { ...product, categoryName: "Copier Paper", barcode: "123456789012" },
      "http://localhost:3000/product/double-a-premium-a4",
    );
    expect(json.category).toBe("Copier Paper");
    expect(json.gtin).toBe("123456789012");
    expect(json.offers.seller).toEqual({ "@type": "Organization", name: "PaperSource" });
  });
});
