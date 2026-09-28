import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{
      userAgent: "*",
      allow: ["/"],
      // Transactional, personal, and query-driven pages should never become
      // crawl targets. They can create duplicate URLs or expose session state.
      disallow: [
        "/admin/",
        "/account/",
        "/checkout/",
        "/cart",
        "/quote",
        "/request-quote",
        "/search",
        "/login",
        "/api/",
      ],
    }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
