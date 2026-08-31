import { expect, test as base } from "@playwright/test";

const test = base.extend<{ consoleGuard: void }>({
  consoleGuard: [async ({ page }, use) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await use();
    expect(errors).toEqual([]);
  }, { auto: true }],
});

test("cross-site Quick Order submissions cannot replace the guest basket cookie", async ({ request }) => {
  const response = await request.post("/quick-order/add", {
    headers: { Origin: "https://unrelated.example" },
    form: { destination: "cart", sku: "HP-305-BLK", quantity: "1" },
    maxRedirects: 0,
  });
  expect(response.status()).toBe(403);
  expect(response.headers()["set-cookie"]).toBeUndefined();
});

test("Quick Order adds two SKUs to the quote basket only", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto("/quick-order", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Quick Order" })).toBeVisible();
  await page.locator("#quick-sku-0").fill("DA-A4-80-500");
  await page.locator("#quick-qty-0").fill("10");
  await page.locator("#quick-sku-1").fill("HP-305-BLK");
  await page.locator("#quick-qty-1").fill("2");
  await page.getByRole("button", { name: "Add all to Quote" }).click();
  await expect(page.getByRole("heading", { name: "Quote list" })).toBeVisible({
    timeout: 45_000,
  });
  await expect(page.getByText("Double A Premium A4 Paper")).toBeVisible();
  await expect(page.getByText("HP 305 Black Ink Cartridge")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Quote list, 12 items" }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Cart, 0 items" }).first(),
  ).toBeVisible();
});

test("Quick Order adds published-price lines to cart without changing quote", async ({ page }) => {
  await page.goto("/quick-order");
  await page.getByLabel("SKU 1", { exact: true }).fill("DA-A4-80-500");
  await page.getByLabel("Quantity 1", { exact: true }).fill("2");
  await page.getByRole("button", { name: "Add all to Cart" }).click();
  await expect(page).toHaveURL(/\/cart\?/);
  await expect(page.getByRole("button", { name: "Cart, 2 items" }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Quote list, 0 items" }).first()).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "Cart, 2 items" }).first()).toBeVisible();
});

test("unknown and empty SKU submissions leave both baskets empty", async ({ page }) => {
  await page.goto("/quick-order");
  await page.getByRole("button", { name: "Add all to Quote" }).click();
  await expect(page.getByRole("alert")).toContainText("Enter at least one SKU");
  await page.getByLabel("SKU 1", { exact: true }).fill("NO-SUCH-SKU");
  await page.getByLabel("Quantity 1", { exact: true }).fill("2");
  await page.getByRole("button", { name: "Add all to Quote" }).click();
  await expect(page.getByRole("alert")).toContainText("not a live catalogue SKU");
  await expect(page.getByRole("button", { name: "Cart, 0 items" }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Quote list, 0 items" }).first()).toBeVisible();
});

test("quote-only quantities cannot be added to cart but can be quoted", async ({ page }) => {
  await page.goto("/quick-order");
  await page.getByLabel("SKU 1", { exact: true }).fill("DA-A4-80-500");
  await page.getByLabel("Quantity 1", { exact: true }).fill("50");
  await page.getByRole("button", { name: "Add all to Cart" }).click();
  await expect(page.getByRole("alert")).toContainText("request-quote");
  await expect(page.getByRole("button", { name: "Cart, 0 items" }).first()).toBeVisible();
  await page.getByLabel("SKU 1", { exact: true }).fill("DA-A4-80-500");
  await page.getByLabel("Quantity 1", { exact: true }).fill("50");
  await page.getByRole("button", { name: "Add all to Quote" }).click();
  await expect(page.getByRole("button", { name: "Quote list, 50 items" }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Cart, 0 items" }).first()).toBeVisible();
});

test("Quick Order considers existing cart quantity before crossing a quote-only tier", async ({ page }) => {
  await page.goto("/quick-order");
  await page.getByLabel("SKU 1", { exact: true }).fill("DA-A4-80-500");
  await page.getByLabel("Quantity 1", { exact: true }).fill("49");
  await page.getByRole("button", { name: "Add all to Cart" }).click();
  await expect(page.getByRole("button", { name: "Cart, 49 items" }).first()).toBeVisible();
  await page.goto("/quick-order");
  await page.getByLabel("SKU 1", { exact: true }).fill("DA-A4-80-500");
  await page.getByLabel("Quantity 1", { exact: true }).fill("1");
  await page.getByRole("button", { name: "Add all to Cart" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("request-quote");
  await expect(page.getByRole("button", { name: "Cart, 49 items" }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Quote list, 0 items" }).first()).toBeVisible();
});

test("duplicate quantity overflow reports an error without creating a quote line", async ({ page }) => {
  await page.goto("/quick-order");
  await page.getByLabel("SKU 1", { exact: true }).fill("DA-A4-80-500");
  await page.getByLabel("Quantity 1", { exact: true }).fill("9999");
  await page.getByLabel("SKU 2", { exact: true }).fill("DA-A4-80-500");
  await page.getByLabel("Quantity 2", { exact: true }).fill("1");
  await page.getByRole("button", { name: "Add all to Quote" }).click();
  await expect(page.getByRole("alert")).toContainText("combined quantity");
  await expect(page.getByRole("button", { name: "Quote list, 0 items" }).first()).toBeVisible();
});

test("cart partial success reports a rejected SKU row instead of silently dropping it", async ({ page }) => {
  await page.goto("/quick-order");
  await page.getByLabel("SKU 1", { exact: true }).fill("HP-305-BLK");
  await page.getByLabel("Quantity 1", { exact: true }).fill("2");
  await page.getByLabel("SKU 2", { exact: true }).fill("DA-A4-80-500");
  await page.getByRole("button", { name: "Add all to Cart" }).click();
  await expect(page).toHaveURL(/\/cart\?/);
  await expect(page.getByRole("main").getByRole("alert")).toContainText("DA-A4-80-500");
  await expect(page.getByRole("button", { name: "Cart, 2 items" }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Quote list, 0 items" }).first()).toBeVisible();
});

test("mobile Quick Order stays within the viewport and preserves cart/quote separation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/quick-order");
  await page.getByRole("button", { name: "Add more rows" }).click();
  await expect(page.getByLabel("SKU 12", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByLabel("SKU 1", { exact: true }).fill("HP-305-BLK");
  await page.getByLabel("Quantity 1", { exact: true }).fill("1");
  await page.getByRole("button", { name: "Add all to Quote" }).click();
  await expect(page.getByRole("button", { name: "Quote list, 1 item" }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Cart, 0 items" }).first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
