import { expect, test } from "@playwright/test";
import { STAFF_DEV_EMAIL, STAFF_DEV_SECRET } from "../src/lib/staff/constants";

test("sales prices a guest RFQ and the customer accepts it into a quote-sourced order", async ({
  page,
}) => {
  test.setTimeout(240_000);
  await page.goto("/");
  await expect(page.getByTestId("add-to-quote-double-a-premium-a4")).toBeEnabled();
  const persisted = page.waitForResponse(
    (response) => response.request().method() === "POST" && response.status() < 400,
    { timeout: 30_000 },
  );
  await page.getByTestId("add-to-quote-double-a-premium-a4").click();
  await persisted;
  await expect(page.getByRole("button", { name: "Quote list, 1 item" }).first()).toBeVisible({
    timeout: 45_000,
  });
  await page.goto("/request-quote");
  await page.getByLabel("Full Name").fill("Kojo Boateng");
  await page.getByLabel(/Phone Number/).fill("0202000000");
  await page.getByRole("textbox", { name: "Region *" }).fill("Greater Accra");
  await page.getByLabel("City / Town").fill("Tema");
  await page.getByLabel("Organisation name").fill("Tema Ridge School");
  await page.getByLabel("Organisation type").selectOption("school");
  await page.getByLabel("Contact person").fill("Kojo Boateng");
  await page.getByLabel("Email").fill("procurement@tema-ridge.test");
  await page.getByRole("button", { name: "Submit RFQ" }).click();
  const received = page.getByRole("heading", { name: /RFQ PSQ-.* received/ });
  await expect(received).toBeVisible({ timeout: 45_000 });
  const receivedTitle = await received.textContent();
  const quoteNumber = receivedTitle?.match(/PSQ-\d+-\d+/)?.[0];
  expect(quoteNumber).toBeTruthy();

  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(STAFF_DEV_EMAIL);
  await page.getByLabel("Staff secret").fill(STAFF_DEV_SECRET);
  await page.getByRole("button", { name: "Sign in" }).click({ noWaitAfter: true });
  await page.waitForURL("**/admin", { timeout: 60_000 });
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible({
    timeout: 45_000,
  });

  await page.goto("/admin/quotes");
  await expect(page.getByRole("heading", { name: "Quotes" })).toBeVisible({
    timeout: 60_000,
  });
  await page.getByRole("link", { name: quoteNumber! }).click({
    timeout: 45_000,
    noWaitAfter: true,
  });
  await expect(page.getByRole("button", { name: "Start review" })).toBeVisible({
    timeout: 60_000,
  });
  await page.getByRole("button", { name: "Start review" }).click({ noWaitAfter: true });
  await expect(page.getByRole("button", { name: "Save prices" })).toBeVisible({
    timeout: 45_000,
  });
  await page.getByRole("button", { name: "Save prices" }).click({ noWaitAfter: true });
  await expect(page.getByRole("button", { name: "Send quote" })).toBeVisible({
    timeout: 45_000,
  });
  await page.getByRole("button", { name: "Send quote" }).click({ noWaitAfter: true });
  await expect(page.getByText("Status: sent")).toBeVisible({ timeout: 45_000 });

  const customerHref = await page.getByTestId("customer-quote-link").getAttribute("href");
  expect(customerHref).toBeTruthy();
  await page.goto(customerHref!);
  await expect(page.getByRole("button", { name: "Accept Quote" })).toBeVisible({
    timeout: 45_000,
  });
  await page.getByRole("button", { name: "Accept Quote" }).click({ noWaitAfter: true });
  await expect(page.getByRole("heading", { name: /Order PSO-/ })).toBeVisible({
    timeout: 45_000,
  });
  await expect(page.getByText("Quote order")).toBeVisible();
});
