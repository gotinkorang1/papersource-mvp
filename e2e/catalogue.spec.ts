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
  await expect(
    page.getByRole("heading", { name: "HP 305 Black Ink Cartridge" }),
  ).toBeVisible();
});

test("brand page lists HP products", async ({ page }) => {
  await page.goto("/brands/hp");
  await expect(page.getByRole("heading", { name: "HP", exact: true })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "HP 305 Black Ink Cartridge" }),
  ).toBeVisible();
});
