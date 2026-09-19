import { expect, test } from "@playwright/test";

test.describe("catalogue presentation modes", () => {
  test("defaults to list mode on mobile when no preference is saved", async ({ page }) => {
    test.skip(test.info().project.name !== "mobile-chromium", "Mobile default is covered in the mobile lane.");
    await page.goto("/shop", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("group", { name: "Catalogue display" }).getByRole("button", { name: "List" })).toHaveAttribute("aria-pressed", "true");
  });

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

  test("keeps content context and mode-specific mobile image sizing", async ({ page }) => {
    test.skip(test.info().project.name !== "mobile-chromium", "Mobile media sizing is covered in the mobile lane.");
    await page.goto("/shop?view=content", { waitUntil: "domcontentloaded" });

    const item = page.locator('[data-catalogue-item="content"]').first();
    await expect(item).toBeVisible();
    await expect(item.getByText(/Available with clear pricing, stock visibility, and delivery support across Accra and Tema\./)).toBeVisible();
    await expect(item.locator("img")).toHaveAttribute("sizes", "(max-width: 640px) 104px, 192px");
  });

  test("opens the compact filter toolbar as a dismissible full-screen sheet", async ({ page }) => {
    await page.goto("/shop", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("textbox", { name: "Search catalogue" })).toBeVisible();
    await page.getByRole("button", { name: "Filters and sort" }).click();
    const sheet = page.getByRole("dialog", { name: "Filters and sorting" });
    await expect(sheet).toBeVisible();
    await expect(sheet.getByRole("combobox", { name: "Sort catalogue" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(sheet).toBeHidden();
  });
});
