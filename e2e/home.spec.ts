import { expect, test, type Page } from "@playwright/test";
import { catalogueSlug, hostedFixtureMissing } from "./test-data";

test.beforeEach(() => test.skip(hostedFixtureMissing, "Set E2E_CATALOGUE_SKU for hosted fixture journeys."));

async function gotoReady(page: Page) {
  await page.goto("/");
  await expect(page.getByTestId(`add-to-quote-${catalogueSlug}`)).toBeEnabled();
}

test("home shows dual-path chrome and Accra & Tema delivery", async ({
  page,
}) => {
  await gotoReady(page);
  await expect(page.getByRole("banner").getByRole("link", { name: "PaperSource home", exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Quote list, 0 items" }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Cart, 0 items" }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Everything your workplace needs." }),
  ).toBeVisible();
  await expect(
    page.getByText("Workplace essentials, delivered across Accra & Tema.", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Add to Cart" }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Add to Quote" }).first(),
  ).toBeVisible();
});

test("add to quote does not fill the retail cart", async ({ page }) => {
  await gotoReady(page);
  await page.getByTestId(`add-to-quote-${catalogueSlug}`).click();
  await expect(page.getByTestId("paper-drawer-quote-list")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Quote list" })).toBeVisible();
  await expect(page.getByText("Procurement basket")).toBeVisible();
  await page.getByRole("dialog", { name: "Quote list" }).getByRole("button", { name: "Close Quote list", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Quote list, 1 item" }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Cart, 0 items" }).first(),
  ).toBeVisible();
});

test("quote basket survives a reload", async ({ page }) => {
  await gotoReady(page);
  const persisted = page.waitForResponse(
    (response) => response.request().method() === "POST" && response.ok(),
  );
  await page.getByTestId(`add-to-quote-${catalogueSlug}`).click();
  await persisted;
  await expect(
    page.getByRole("button", { name: "Quote list, 1 item" }).first(),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Quote list, 1 item" }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Cart, 0 items" }).first(),
  ).toBeVisible();
});
