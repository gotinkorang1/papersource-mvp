import { describe, expect, it } from "vitest";
import * as seo from "./seo";
import { collectionItemPosition, collectionPageJsonLd, pageMetadata, siteJsonLd, webPageJsonLd } from "./seo";

describe("siteJsonLd", () => {
  it("describes PaperSource as a Ghana workplace-supplies business with site search", () => {
    const json = siteJsonLd();

    expect(json).toMatchObject({
      "@context": "https://schema.org",
      "@graph": expect.arrayContaining([
        expect.objectContaining({ "@type": "Organization", name: "PaperSource Ghana", knowsAbout: expect.arrayContaining(["Office stationery", "Books", "School supplies"]) }),
        expect.objectContaining({ "@type": "WebSite", name: "PaperSource Ghana" }),
        expect.objectContaining({ "@type": ["LocalBusiness", "Store"], areaServed: expect.arrayContaining(["Accra", "Tema"]) }),
      ]),
    });

    const website = json["@graph"].find((item: { "@type": string | string[] }) => item["@type"] === "WebSite");
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

describe("pageMetadata", () => {
  it("publishes a verified modification timestamp when supplied", () => {
    const metadata = pageMetadata({
      title: "A4 paper",
      description: "A4 paper for Ghana workplaces.",
      path: "/product/a4-paper",
      modifiedTime: "2026-09-17T12:00:00Z",
    });

    expect(metadata.openGraph).toMatchObject({ modifiedTime: "2026-09-17T12:00:00.000Z" });
  });
});

describe("collectionPageJsonLd", () => {
  it("publishes crawlable catalogue items with absolute URLs", () => {
    const json = collectionPageJsonLd({
      name: "Pens in Ghana",
      description: "Pens for Ghana workplaces.",
      url: "https://papersourcegh.com/shop/pens",
      totalItems: 42,
      items: [{ name: "Blue pen", url: "https://papersourcegh.com/product/blue-pen", position: 1 }],
    });

    expect(json).toMatchObject({ "@type": "CollectionPage", inLanguage: "en-GH", mainEntity: { "@type": "ItemList", numberOfItems: 42 } });
    expect(json.mainEntity.itemListElement[0]).toMatchObject({ position: 1, url: "https://papersourcegh.com/product/blue-pen" });
  });

  it("keeps item-list positions stable across paginated catalogue pages", () => {
    expect(collectionItemPosition(2, 24, 0)).toBe(25);
    expect(collectionItemPosition(3, 24, 5)).toBe(54);
  });
});

describe("webPageJsonLd", () => {
  it("includes CMS freshness and site entity relationships", () => {
    const json = webPageJsonLd({ name: "Delivery guide", description: "Delivery information", url: "https://papersourcegh.com/pages/delivery-guide", dateModified: "2026-09-10T00:00:00Z" });
    expect(json).toMatchObject({ "@type": "WebPage", inLanguage: "en-GH", dateModified: "2026-09-10T00:00:00.000Z", isPartOf: { "@id": expect.stringContaining("#website") }, about: { "@id": expect.stringContaining("#organization") } });
  });
});
