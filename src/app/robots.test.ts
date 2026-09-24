import { describe, expect, it } from "vitest";
import robots from "./robots";
import { SITE_URL } from "@/lib/seo";

describe("robots", () => {
  it("publishes the canonical sitemap and protects private application areas", () => {
    const policy = robots();

    expect(policy.sitemap).toBe(`${SITE_URL}/sitemap.xml`);
    expect(policy.host).toBe(SITE_URL);
    expect(policy.rules).toEqual([
      expect.objectContaining({
        userAgent: "*",
        allow: ["/"],
        disallow: expect.arrayContaining(["/admin/", "/account/", "/checkout/", "/api/"]),
      }),
    ]);
  });
});
