import { describe, expect, it } from "vitest";
import { siteJsonLd } from "./seo";

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
