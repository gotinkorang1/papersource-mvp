import { expect, test } from "@playwright/test";

test("catalogue and product pages expose dual-path CTAs", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto("/shop", { waitUntil: "domcontentloaded" });
  const productLinks = page.locator('a[href^="/product/"]');
  await expect(productLinks.first()).toBeVisible();
  const productHrefs = await productLinks.evaluateAll((links) => links.map((link) => link.getAttribute("href")).filter((href): href is string => Boolean(href)));
  let productHref: string | null = null;
  for (const href of productHrefs) {
    productHref = href;
    if (!productHref) continue;
    await page.goto(productHref, { waitUntil: "domcontentloaded" });
    const purchase = page.getByTestId("product-purchase");
    if (await purchase.count() && await purchase.getByRole("button", { name: "Add to Cart" }).count() && await purchase.getByRole("button", { name: "Add to Quote" }).count()) break;
  }
  expect(productHref).toBeTruthy();
  const purchase = page.getByTestId("product-purchase");
  await expect(purchase.getByRole("button", { name: "Add to Cart" })).toBeVisible();
  await expect(purchase.getByRole("button", { name: "Add to Quote" })).toBeVisible();
});

test("search preserves the submitted query and renders a useful state", async ({ page }) => {
  await page.goto("/search?q=pen");
  await expect(page.locator("#catalogue-search")).toHaveValue("pen");
  await expect(page.getByRole("heading", { name: /Results for pen/i })).toBeVisible();
  await expect(page.getByText(/No exact matches yet|product|products/i).first()).toBeVisible();
});

test("a catalogue product can be added to the quote path", async ({ page }) => {
  await page.goto("/shop", { waitUntil: "domcontentloaded" });
  const productLinks = page.locator('a[href^="/product/"]');
  const productHrefs = await productLinks.evaluateAll((links) => links.map((link) => link.getAttribute("href")).filter((href): href is string => Boolean(href)));
  let productHref: string | null = null;
  for (const href of productHrefs) {
    if (!href) continue;
    await page.goto(href, { waitUntil: "domcontentloaded" });
    if (await page.getByTestId("product-purchase").getByRole("button", { name: "Add to Quote" }).count()) { productHref = href; break; }
  }
  expect(productHref).toBeTruthy();
  await page.goto(productHref!, { waitUntil: "domcontentloaded" });
  const quoteButton = page.getByTestId("product-purchase").getByRole("button", { name: "Add to Quote" });
  await expect(quoteButton).toBeVisible();
  const persisted = page.waitForResponse(
    (response) => response.request().method() === "POST" && response.ok(),
    { timeout: 30_000 },
  );
  await Promise.all([persisted, quoteButton.click()]);
  await expect(page.getByTestId("paper-drawer-quote-list")).toBeVisible();
});

test("brand and catalogue pages render without a hard-coded product fixture", async ({ page }) => {
  await page.goto("/brands", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /brand/i }).first()).toBeVisible();
});
