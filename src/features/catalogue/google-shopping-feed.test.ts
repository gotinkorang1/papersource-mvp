import { describe, expect, it } from "vitest";
import { renderGoogleShoppingFeed, shoppingFeedTitle } from "./google-shopping-feed";

describe("Google Shopping feed", () => {
  it("builds descriptive book titles with author and specification", () => {
    expect(shoppingFeedTitle({ name: "Diary of a Wimpy Kid: Hot Mess", author: "Jeff Kinney", specification: "Paperback" })).toBe("Diary of a Wimpy Kid: Hot Mess by Jeff Kinney — Paperback");
  });

  it("accepts a validated ISBN as the product GTIN", () => {
    const xml = renderGoogleShoppingFeed([{
      id: "ISBN-9781637996959",
      title: "Diary of a Wimpy Kid: Hot Mess by Jeff Kinney",
      description: "A paperback book.",
      link: "https://papersourcegh.com/product/diary-of-a-wimpy-kid-hot-mess-jeff-kinney",
      imageLink: "https://cdn.example/front.jpg",
      availability: "in stock",
      pricePesewas: 7000,
      brand: "Abrams",
      productType: "Books",
      gtin: "9781637996959",
    }]);

    expect(xml).toContain("<g:gtin>9781637996959</g:gtin>");
    expect(xml).toContain("<g:identifier_exists>yes</g:identifier_exists>");
  });

  it("renders escaped GHS product entries and valid identifiers", () => {
    const xml = renderGoogleShoppingFeed([{ id: "SKU-1", title: "A & B", description: "80gsm <paper>", link: "https://papersourcegh.com/product/a-b", imageLink: "https://cdn.example/a.jpg", availability: "in stock", pricePesewas: 7850, brand: "Example Press", productType: "Paper", gtin: "123456789012" }]);

    expect(xml).toContain("xmlns:g=\"http://base.google.com/ns/1.0\"");
    expect(xml).toContain("A &amp; B");
    expect(xml).toContain("80gsm &lt;paper&gt;");
    expect(xml).toContain("78.50 GHS");
    expect(xml).toContain("<g:identifier_exists>yes</g:identifier_exists>");
  });

  it("publishes useful fallback copy when a product description is empty", () => {
    const xml = renderGoogleShoppingFeed([
      {
        id: "SKU-2",
        title: "Classic Notebook",
        description: "   ",
        link: "https://papersourcegh.com/product/classic-notebook",
        availability: "in stock",
        pricePesewas: 5000,
        brand: "PaperSource",
        productType: "Notebooks",
      },
    ]);

    expect(xml).toContain("Classic Notebook by PaperSource. Shop Notebooks from PaperSource Ghana with Accra, Tema and nationwide supply on request.");
  });

  it("publishes verified secondary product images as additional image links", () => {
    const xml = renderGoogleShoppingFeed([
      {
        id: "SKU-3",
        title: "Diary of a Wimpy Kid: Hot Mess",
        description: "A paperback book.",
        link: "https://papersourcegh.com/product/diary-of-a-wimpy-kid-hot-mess-jeff-kinney",
        imageLink: "https://cdn.example/front.jpg",
        additionalImageLinks: ["https://cdn.example/back.jpg", "https://cdn.example/front.jpg"],
        availability: "in stock",
        pricePesewas: 7000,
        brand: "Abrams",
        productType: "Books",
      },
    ]);

    expect(xml).toContain("<g:image_link>https://cdn.example/front.jpg</g:image_link>");
    expect(xml).toContain("<g:additional_image_link>https://cdn.example/back.jpg</g:additional_image_link>");
    expect(xml.match(/<g:additional_image_link>/g)).toHaveLength(1);
  });
});
