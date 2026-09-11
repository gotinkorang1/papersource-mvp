import { expect, test } from "@playwright/test";

test("product quick view can be closed", async ({ page }) => {
  await page.goto("/shop");
  const quickView = page.getByRole("button", { name: "Quick view" }).first();
  await expect(quickView).toBeVisible();
  await quickView.click();
  const dialog = page.locator('[role="dialog"]').filter({ has: page.getByRole("button", { name: "Close quick view" }) });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Close quick view" }).last().click();
  await expect(dialog).toBeHidden();

  await quickView.click();
  await expect(page.locator('[role="dialog"]').filter({ has: page.getByRole("button", { name: "Close quick view" }) })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator('[role="dialog"]').filter({ has: page.getByRole("button", { name: "Close quick view" }) })).toBeHidden();

  await quickView.click();
  const reopened = page.locator('[role="dialog"]').filter({ has: page.getByRole("button", { name: "Close quick view" }) });
  await reopened.getByRole("button", { name: "Dismiss quick view" }).click({ position: { x: 5, y: 5 } });
  await expect(reopened).toBeHidden();
});
