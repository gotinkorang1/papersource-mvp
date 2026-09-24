import { describe, expect, it } from "vitest";
import { breadcrumbJsonLd } from "@/features/catalogue/json-ld";
import * as seo from "./seo";
import { SITE_URL, absoluteUrl, collectionItemPosition, collectionPageJsonLd, pageMetadata, seoDescription, siteJsonLd, webPageJsonLd } from "./seo";

describe("canonical host", () => {
  it("uses the live www destination for every public URL", () => {
    expect(SITE_URL).toBe("https://www.papersourcegh.com");
    expect(absoluteUrl("/shop")).toBe("https://www.papersourcegh.com/shop");
  });
});

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

    const organization = json["@graph"].find((item: { "@type": string | string[] }) => item["@type"] === "Organization") as Record<string, unknown> | undefined;
    expect(organization?.hasMerchantReturnPolicy).toEqual({ "@id": expect.stringContaining("#return-policy") });
    expect(organization?.hasShippingService).toEqual({ "@id": expect.stringContaining("#shipping-service") });
    expect(json["@graph"]).toEqual(expect.arrayContaining([
      expect.objectContaining({ "@type": "MerchantReturnPolicy", merchantReturnDays: 7, returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow" }),
      expect.objectContaining({ "@type": "ShippingService", areaServed: expect.arrayContaining(["Accra", "Tema", "Ghana"]) }),
    ]));

    const returnPolicy = json["@graph"].find((item: { "@type": string | string[] }) => item["@type"] === "MerchantReturnPolicy") as Record<string, unknown>;
    expect(returnPolicy).not.toHaveProperty("returnMethod");
    expect(returnPolicy).not.toHaveProperty("returnFees");
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

  it("keeps metadata descriptions concise without cutting through a word", () => {
    const result = seoDescription("Office paper, notebooks and printing supplies for schools and workplaces across Accra and Tema.", 70);

    expect(result).toBe("Office paper, notebooks and printing supplies for schools and…");
    expect(result.length).toBeLessThanOrEqual(70);
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

    expect(json).toMatchObject({ "@type": "CollectionPage", inLanguage: "en-GH", isPartOf: { "@id": expect.stringContaining("#website") }, mainEntity: { "@type": "ItemList", numberOfItems: 42 } });
    expect(json.mainEntity.itemListElement[0]).toMatchObject({ position: 1, url: "https://papersourcegh.com/product/blue-pen" });
  });

  it("keeps item-list positions stable across paginated catalogue pages", () => {
    expect(collectionItemPosition(2, 24, 0)).toBe(25);
    expect(collectionItemPosition(3, 24, 5)).toBe(54);
  });
});

describe("breadcrumbJsonLd", () => {
  it("gives each breadcrumb list a stable page-scoped identifier", () => {
    const json = breadcrumbJsonLd(
      [{ name: "Shop", href: "/shop" }, { name: "Paper", href: "/shop/paper" }],
      "https://papersourcegh.com",
    );

    expect(json["@id"]).toBe("https://papersourcegh.com/shop/paper#breadcrumb");
  });
});

describe("webPageJsonLd", () => {
  it("includes CMS freshness and site entity relationships", () => {
    const json = webPageJsonLd({ name: "Delivery guide", description: "Delivery information", url: "https://papersourcegh.com/pages/delivery-guide", dateModified: "2026-09-10T00:00:00Z" });
    expect(json).toMatchObject({ "@type": "WebPage", inLanguage: "en-GH", dateModified: "2026-09-10T00:00:00.000Z", isPartOf: { "@id": expect.stringContaining("#website") }, about: { "@id": expect.stringContaining("#organization") } });
  });
});
