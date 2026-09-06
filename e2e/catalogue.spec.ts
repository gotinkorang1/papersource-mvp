import { expect, test } from "@playwright/test";

test("catalogue and product pages expose dual-path CTAs", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto("/shop", { waitUntil: "domcontentloaded" });
  const productLink = page.locator('a[href^="/product/"]').first();
  await expect(productLink).toBeVisible();
  const productHref = await productLink.getAttribute("href");
  expect(productHref).toBeTruthy();
  await page.goto(productHref!, { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("button", { name: "Add to Cart" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add to Quote" })).toBeVisible();
});

test("search preserves the submitted query and renders a useful state", async ({ page }) => {
  await page.goto("/search?q=pen");
  await expect(page.locator("#catalogue-search")).toHaveValue("pen");
  await expect(page.getByRole("heading", { name: /Results for pen/i })).toBeVisible();
  await expect(page.getByText(/No exact matches yet|product|products/i).first()).toBeVisible();
});

test("a catalogue product can be added to the quote path", async ({ page }) => {
  await page.goto("/shop", { waitUntil: "domcontentloaded" });
  const productHref = await page.locator('a[href^="/product/"]').first().getAttribute("href");
  expect(productHref).toBeTruthy();
  await page.goto(productHref!, { waitUntil: "domcontentloaded" });
  const quoteButton = page.getByRole("button", { name: "Add to Quote" });
  await expect(quoteButton).toBeVisible();
  const persisted = page.waitForResponse(
    (response) => response.request().method() === "POST" && response.ok(),
    { timeout: 30_000 },
  );
  await Promise.all([persisted, quoteButton.click()]);
  await expect(page.getByRole("button", { name: /Quote list, 1 item/ }).first()).toBeVisible();
});

test("brand and catalogue pages render without a hard-coded product fixture", async ({ page }) => {
  await page.goto("/brands", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /brand/i }).first()).toBeVisible();
});
