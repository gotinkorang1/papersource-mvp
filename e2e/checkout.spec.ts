import { expect, test, type Page } from "@playwright/test";

async function addFirstInStockToCart(page: Page) {
  await page.goto("/");
  await expect(page.getByTestId("add-to-quote-double-a-premium-a4")).toBeEnabled();
  const persisted = page.waitForResponse(
    (response) => response.request().method() === "POST" && response.ok(),
    { timeout: 30_000 },
  );
  await page.getByRole("button", { name: "Add to Cart" }).first().click();
  await persisted;
  await expect(
    page.getByRole("button", { name: "Cart, 1 item" }).first(),
  ).toBeVisible();
  await page.goto("/checkout");
  await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible();
}

async function fillRequiredGhanaFields(page: Page) {
  await page.getByLabel("Full Name").fill("Ama Mensah");
  await page.getByLabel(/Phone Number/).fill("0244111222");
  await page.getByRole("textbox", { name: "Region *" }).fill("Greater Accra");
  await page.getByLabel("City / Town").fill("Accra");
  await page.getByLabel("Email").fill("ama.mensah@papersource.test");
}

test.describe("guest checkout", () => {
  test.describe.configure({ mode: "serial", timeout: 90_000 });

  test("records an Accra order without charging Paystack", async ({ page }) => {
    await addFirstInStockToCart(page);
    await fillRequiredGhanaFields(page);
    await page.getByRole("button", { name: "Place order" }).click();
    await expect(page.getByRole("heading", { name: /Order PSO-/ })).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByText(/Payment has not been taken yet/)).toBeVisible();
    await expect(page.getByText("pending payment")).toBeVisible();
    await expect(page.getByRole("button", { name: "Pay with Paystack" })).toBeVisible();
    await expect(page.getByText("To be confirmed")).toHaveCount(0);
  });

  test("does not invent a nationwide delivery fee", async ({ page }) => {
    await addFirstInStockToCart(page);
    await fillRequiredGhanaFields(page);
    await page.getByRole("radio", { name: "Other Region" }).click();
    await page.getByRole("button", { name: "Place order" }).click();
    await expect(page.getByRole("heading", { name: /Order PSO-/ })).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByText(/No delivery fee was invented/)).toBeVisible();
    await expect(page.getByText("awaiting terms")).toBeVisible();
    await expect(page.getByText("To be confirmed")).toBeVisible();
    await expect(page.getByRole("button", { name: "Pay with Paystack" })).toHaveCount(0);
  });
});
