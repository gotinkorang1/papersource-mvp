import { expect, test } from "@playwright/test";

test.describe("catalogue presentation modes", () => {
  test("switches between accessible customer views without navigation", async ({ page }) => {
    await page.goto("/shop", { waitUntil: "domcontentloaded" });
    const display = page.getByRole("group", { name: "Catalogue display" });
    await expect(display).toBeVisible();

    await display.getByRole("button", { name: "List" }).click();
    await expect(display.getByRole("button", { name: "List" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator('[data-catalogue-view="list"]').first()).toBeVisible();

    await display.getByRole("button", { name: "Content" }).click();
    await expect(page.locator('[data-catalogue-view="content"]').first()).toBeVisible();
    await display.getByRole("button", { name: "Grid" }).click();
    await expect(page.locator('[data-catalogue-view="grid"]').first()).toBeVisible();
  });

  test("honours a validated view query while preserving the catalogue route", async ({ page }) => {
    await page.goto("/shop?view=list", { waitUntil: "domcontentloaded" });
    const display = page.getByRole("group", { name: "Catalogue display" });
    await expect(display.getByRole("button", { name: "List" })).toHaveAttribute("aria-pressed", "true");
    await expect(page).toHaveURL(/\/shop\?view=list/);
  });
});
