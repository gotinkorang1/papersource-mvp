import { expect, test } from "@playwright/test";

const isLocalTarget = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/i.test(
  process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
);

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
  // A local run may not have the dedicated Postgres service running. The
  // endpoint should still expose a safe, machine-readable degraded response;
  // hosted targets must remain strictly healthy.
  expect(isLocalTarget ? [200, 503] : [200]).toContain(response.status());
  const body = await response.json();
  expect(isLocalTarget ? ["ok", "degraded"] : ["ok"]).toContain(body.status);
  expect(["ok", "not_configured"]).toContain(body.checks?.database);
  expect(["configured", "not_configured"]).toContain(body.checks?.observability);
  expect(["configured", "test_mode", "not_configured"]).toContain(body.checks?.integrations?.paystack);
  expect(["configured", "mock_mode", "not_configured"]).toContain(body.checks?.integrations?.email);
  expect(["configured", "not_configured"]).toContain(body.checks?.integrations?.cloudinary);
  const serialized = JSON.stringify(body);
  expect(serialized).not.toMatch(/DATABASE_URL|SENTRY_DSN|PAYSTACK_SECRET_KEY|CLOUDINARY_API_SECRET|RESEND_API_KEY/);
  expect(typeof body.durationMs).toBe("number");
});
