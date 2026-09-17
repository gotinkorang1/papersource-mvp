import { describe, expect, it } from "vitest";
import * as seo from "./seo";
import { collectionPageJsonLd, siteJsonLd } from "./seo";

describe("siteJsonLd", () => {
  it("describes PaperSource as a Ghana workplace-supplies business with site search", () => {
    const json = siteJsonLd();

    expect(json).toMatchObject({
      "@context": "https://schema.org",
      "@graph": expect.arrayContaining([
        expect.objectContaining({ "@type": "Organization", name: "PaperSource Ghana" }),
        expect.objectContaining({ "@type": "WebSite", name: "PaperSource Ghana" }),
        expect.objectContaining({ "@type": "LocalBusiness", areaServed: expect.arrayContaining(["Accra", "Tema"]) }),
      ]),
    });

    const website = json["@graph"].find((item: { "@type": string }) => item["@type"] === "WebSite");
    expect(website).toBeDefined();
    expect((website?.potentialAction as { target: string }).target).toContain("/search?q={search_term_string}");
  });
});

describe("productSeoTitle", () => {
  it("joins only populated product identity parts", () => {
    const productSeoTitle = Reflect.get(seo, "productSeoTitle");

    expect(productSeoTitle).toEqual(expect.any(Function));

    if (typeof productSeoTitle !== "function") return;

    expect(productSeoTitle("Stranded", "")).toBe("Stranded");
    expect(productSeoTitle("Stranded", "Paperback")).toBe("Stranded · Paperback");
  });
});

describe("collectionPageJsonLd", () => {
  it("publishes crawlable catalogue items with absolute URLs", () => {
    const json = collectionPageJsonLd({
      name: "Pens in Ghana",
      description: "Pens for Ghana workplaces.",
      url: "https://papersourcegh.com/shop/pens",
      items: [{ name: "Blue pen", url: "https://papersourcegh.com/product/blue-pen", position: 1 }],
    });

    expect(json).toMatchObject({ "@type": "CollectionPage", mainEntity: { "@type": "ItemList", numberOfItems: 1 } });
    expect(json.mainEntity.itemListElement[0]).toMatchObject({ position: 1, url: "https://papersourcegh.com/product/blue-pen" });
  });
});
