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

  it("includes image when Cloudinary (or other) URL is present", () => {
    const json = productJsonLd(
      { ...product, imageSrc: "https://res.cloudinary.com/demo/image.jpg" },
      "http://localhost:3000/product/double-a-premium-a4",
    );
    expect(json.image).toBe("https://res.cloudinary.com/demo/image.jpg");
  });
});
