import { describe, expect, it } from "vitest";
import { renderGoogleShoppingFeed } from "./google-shopping-feed";

describe("Google Shopping feed", () => {
  it("renders escaped GHS product entries and valid identifiers", () => {
    const xml = renderGoogleShoppingFeed([{ id: "SKU-1", title: "A & B", description: "80gsm <paper>", link: "https://papersourcegh.com/product/a-b", imageLink: "https://cdn.example/a.jpg", availability: "in stock", pricePesewas: 7850, brand: "Example Press", productType: "Paper", gtin: "123456789012" }]);

    expect(xml).toContain("xmlns:g=\"http://base.google.com/ns/1.0\"");
    expect(xml).toContain("A &amp; B");
    expect(xml).toContain("80gsm &lt;paper&gt;");
    expect(xml).toContain("78.50 GHS");
    expect(xml).toContain("<g:identifier_exists>yes</g:identifier_exists>");
  });
});
