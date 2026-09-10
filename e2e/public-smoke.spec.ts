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
  ].filter((route) => {
    if (test.info().project.name !== "mobile-chromium") return true;
    // API and crawler endpoints are covered by the desktop request context;
    // the mobile lane focuses on responsive storefront pages.
    return !route.startsWith("/api/") && route !== "/sitemap.xml";
  });

  for (const route of routes) {
    const response = await request.get(route, { timeout: route === "/sitemap.xml" ? 90_000 : 30_000 });
    expect(response.ok(), `${route} should respond successfully`).toBe(true);
  }
});

test("health endpoint exposes non-sensitive readiness checks", async ({ request }) => {
  test.skip(test.info().project.name === "mobile-chromium", "Health API is covered in the desktop request lane.");
  const response = await request.get("/api/health");
  expect(response.ok()).toBe(true);
  const body = await response.json();
  expect(body.status).toBe("ok");
  expect(["ok", "not_configured"]).toContain(body.checks?.database);
  expect(["configured", "not_configured"]).toContain(body.checks?.observability);
  expect(typeof body.durationMs).toBe("number");
});
