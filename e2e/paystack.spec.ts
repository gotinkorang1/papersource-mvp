import { expect, test, type Page } from "@playwright/test";
import { PAYSTACK_MOCK_SECRET, signPaystackBody } from "../src/lib/paystack/signature";

async function placeAccraOrder(page: Page) {
  await page.goto("/");
  await expect(page.getByTestId("add-to-quote-double-a-premium-a4")).toBeEnabled();
  const persisted = page.waitForResponse(
    (response) => response.request().method() === "POST" && response.status() < 400,
    { timeout: 30_000 },
  );
  await page.locator('button:not([disabled])').filter({ hasText: "Add to Cart" }).first().click();
  await persisted;
  await page.goto("/checkout");
  await page.getByLabel("Full Name").fill("Ama Mensah");
  await page.getByLabel(/Phone Number/).fill("0244111222");
  await page.getByRole("textbox", { name: "Region *" }).fill("Greater Accra");
  await page.getByLabel("City / Town").fill("Accra");
  await page.getByLabel("Email").fill("ama.mensah@papersource.test");
  await page.getByRole("button", { name: "Place order" }).click();
  await expect(page.getByRole("heading", { name: /Order PSO-/ })).toBeVisible({
    timeout: 45_000,
  });
}

test("Paystack mock checkout marks the order paid via signed webhook", async ({
  page,
  request,
}) => {
  test.setTimeout(90_000);
  await placeAccraOrder(page);
  await page.getByRole("button", { name: "Pay with Paystack" }).click();
  await expect(page.getByRole("heading", { name: /Pay GHS/ })).toBeVisible({
    timeout: 30_000,
  });
  const reference = page.url().split("/pay/mock/")[1]?.split("?")[0] ?? "";
  expect(reference.length).toBeGreaterThan(8);
  await page.getByRole("button", { name: "Simulate successful payment" }).click();
  await expect(page.getByRole("heading", { name: /Order PSO-/ })).toBeVisible({
    timeout: 45_000,
  });
  await expect(page.getByText("Payment is confirmed")).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Cart, 0 items" }).first(),
  ).toBeVisible();

  const replay = JSON.stringify({
    event: "charge.success",
    data: {
      id: `mock_${reference}`,
      status: "success",
      reference,
      amount: 1,
      currency: "GHS",
    },
  });
  const replayResponse = await request.post("/api/paystack/webhook", {
    data: replay,
    headers: {
      "content-type": "application/json",
      "x-paystack-signature": signPaystackBody(replay, PAYSTACK_MOCK_SECRET),
    },
  });
  expect(replayResponse.status()).toBe(200);

  await page.reload();
  await expect(page.getByText("Payment is confirmed")).toBeVisible();
  await expect(page.getByRole("button", { name: "Pay with Paystack" })).toHaveCount(0);
});

test("Paystack webhook rejects a bad signature", async ({ request }) => {
  const response = await request.post("/api/paystack/webhook", {
    data: JSON.stringify({ event: "charge.success" }),
    headers: {
      "content-type": "application/json",
      "x-paystack-signature": "deadbeef",
    },
    timeout: 30_000,
  });
  expect(response.status()).toBe(401);
});
