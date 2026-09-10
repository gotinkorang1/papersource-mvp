import { expect, test } from "@playwright/test";
import { hostedFixtureMissing } from "./test-data";

test.beforeEach(() => test.skip(hostedFixtureMissing, "Set E2E_CATALOGUE_SKU for hosted fixture journeys."));

test("guest RFQ submit assigns a quote number", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto("/");
  await expect(page.getByTestId(/^add-to-quote-/).first()).toBeEnabled();
  const persisted = page.waitForResponse(
    (response) => response.request().method() === "POST" && response.ok(),
    { timeout: 30_000 },
  );
  await page.getByTestId(/^add-to-quote-/).first().click();
  await persisted;
  await expect(
    page.getByRole("button", { name: "Quote list, 1 item" }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Cart, 0 items" }).first(),
  ).toBeVisible();
  await page.goto("/request-quote");
  await expect(page.getByRole("heading", { name: /request a quote/i })).toBeVisible();
  await page.getByLabel("Full Name").fill("Kojo Boateng");
  await page.getByLabel(/Phone Number/).fill("0202000000");
  await page.getByRole("textbox", { name: "Region *" }).fill("Greater Accra");
  await page.getByLabel("City / Town").fill("Tema");
  await page.getByLabel("Organisation name").fill("Tema Ridge School");
  await page.getByLabel("Organisation type").selectOption("school");
  await page.getByLabel("Contact person").fill("Kojo Boateng");
  await page.getByLabel("Email").fill("procurement@tema-ridge.test");
  await page.getByRole("button", { name: "Submit RFQ" }).click();
  await expect(page.getByRole("heading", { name: /RFQ PSQ-.* received/ })).toBeVisible({
    timeout: 45_000,
  });
  await expect(
    page.getByRole("button", { name: "Quote list, 0 items" }).first(),
  ).toBeVisible({ timeout: 15_000 });
  await expect(
    page.getByRole("button", { name: "Cart, 0 items" }).first(),
  ).toBeVisible();
});
