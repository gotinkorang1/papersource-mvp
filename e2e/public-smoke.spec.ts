import { expect, test } from "@playwright/test";

test("public storefront routes respond successfully", async ({ request }) => {
  test.setTimeout(180_000);
  const routes = [
    "/",
    "/shop",
    "/search",
    "/cart",
    "/quote",
    "/checkout",
    "/login",
    "/faq",
    "/robots.txt",
    "/sitemap.xml",
    "/api/health",
    "/api/search/suggestions?q=pen",
  ];

  await Promise.all(routes.map(async (route) => {
    const response = await request.get(route);
    expect(response.ok(), `${route} should respond successfully`).toBe(true);
  }));
});
