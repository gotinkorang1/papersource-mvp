import { expect, test } from "@playwright/test";

test("mega menu lists workplace categories", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Shop" }).hover();
  await expect(page.getByRole("menuitem", { name: "Paper" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Printing" })).toBeVisible();
  await page.getByRole("button", { name: "Business" }).hover();
  await expect(page.getByRole("menuitem", { name: "Schools" })).toBeVisible();
});

test("checkout uses Ghana address fields", async ({ page }) => {
  await page.goto("/checkout");
  await expect(page.getByLabel(/Phone Number/)).toBeVisible();
  await expect(page.getByLabel(/GhanaPost GPS/)).toBeVisible();
  await expect(page.getByLabel(/zip/i)).toHaveCount(0);
  await page.getByRole("radio", { name: "Other Region" }).click();
  await expect(
    page.getByText(/nationwide delivery option and cost/i),
  ).toBeVisible();
});

test("design system preview is available", async ({ page }) => {
  await page.goto("/design-system");
  await expect(page.getByRole("heading", { name: "Design system" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Quote", exact: true })).toBeVisible();
  await expect(page.getByLabel(/Phone Number/)).toBeVisible();
});

test.describe("mobile chrome", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("bottom nav shows quote and cart", async ({ page }) => {
    await page.goto("/");
    const mobile = page.getByRole("navigation", { name: "Mobile" });
    await expect(mobile).toBeVisible();
    await expect(mobile.getByRole("link", { name: "Home" })).toBeVisible();
    await expect(mobile.getByRole("link", { name: "Shop" })).toBeVisible();
    await expect(mobile.getByRole("link", { name: "Search" })).toBeVisible();
    await expect(
      mobile.getByRole("button", { name: "Quote list, 0 items" }),
    ).toBeVisible();
    await expect(
      mobile.getByRole("button", { name: "Cart, 0 items" }),
    ).toBeVisible();
  });
});
