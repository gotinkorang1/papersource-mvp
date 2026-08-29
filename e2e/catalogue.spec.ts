import { expect, test } from "@playwright/test";

test("category and product pages expose dual-path CTAs", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto("/shop/paper", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("heading", { name: "Paper", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Double A Premium A4 Paper" }),
  ).toBeVisible();
  await page.goto("/product/double-a-premium-a4", {
    waitUntil: "domcontentloaded",
  });
  await expect(page.getByText("SKU DA-A4-80-500")).toBeVisible();
  await expect(page.getByRole("button", { name: "Add to Cart" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add to Quote" })).toBeVisible();
});

test("search matches a toner alias", async ({ page }) => {
  await page.goto("/search?q=HP%20305%20black");
  await expect(page.locator("#catalogue-search")).toHaveValue("HP 305 black");
  await expect(
    page.getByRole("heading", { name: "HP 305 Black Ink Cartridge" }),
  ).toBeVisible();
});

test("search to product adds to cart only", async ({ page }) => {
  await page.goto("/search?q=A4%2080gsm");
  await expect(page.locator("#catalogue-search")).toHaveValue("A4 80gsm");
  await expect(
    page.getByRole("heading", { name: "Double A Premium A4 Paper" }),
  ).toBeVisible();
  await page.goto("/product/double-a-premium-a4", {
    waitUntil: "domcontentloaded",
  });
  await expect(page.getByText("SKU DA-A4-80-500")).toBeVisible();
  const persisted = page.waitForResponse(
    (response) => response.request().method() === "POST" && response.ok(),
    { timeout: 30_000 },
  );
  await page.getByRole("button", { name: "Add to Cart" }).click();
  await persisted;
  await expect(
    page.getByRole("button", { name: "Cart, 1 item" }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Quote list, 0 items" }).first(),
  ).toBeVisible();
});

test("brand page lists HP products", async ({ page }) => {
  await page.goto("/brands/hp");
  await expect(page.getByRole("heading", { name: "HP", exact: true })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "HP 305 Black Ink Cartridge" }),
  ).toBeVisible();
});
