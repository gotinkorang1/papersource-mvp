import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { spawn, execFile } from "node:child_process";
import { promisify } from "node:util";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { mkdir } from "node:fs/promises";
import { chromium, expect } from "@playwright/test";
import postgres from "postgres";
import { localDatabaseUrl, verifyLocalRuntime } from "./local-supabase.mjs";

const origin = "http://localhost:3000";
let checkpoint = "local runtime";
async function main() {
  const status = await verifyLocalRuntime();
  const occupied = await fetch(origin, { signal: AbortSignal.timeout(1500) }).then(() => true).catch(() => false);
  assert.equal(occupied, false, "Stop the existing development server before this isolated test.");
  const email = `account-browser-${randomUUID()}@papersource.test`;
  const password = `Initial!${randomUUID()}`;
  const newPassword = `Changed!${randomUUID()}`;
  const organizationName = `Browser fixture ${randomUUID()}`;
  const db = postgres(localDatabaseUrl, { max: 1, onnotice: () => {} });
  const serverMode = process.env.ACCOUNT_TEST_PRODUCTION === "true" ? "start" : "dev";
  const server = spawn(process.execPath, [fileURLToPath(new URL("../node_modules/next/dist/bin/next", import.meta.url)), serverMode], {
    windowsHide: true, stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, DATABASE_URL: localDatabaseUrl, NEXT_PUBLIC_SITE_URL: origin,
      NEXT_PUBLIC_SUPABASE_URL: status.API_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: status.PUBLISHABLE_KEY,
      SUPABASE_SERVICE_ROLE_KEY: "", PAYSTACK_MODE: "mock", PAYSTACK_SECRET_KEY: "", EMAIL_MODE: "mock", RESEND_API_KEY: "" },
  });
  // Keep diagnostics inside this process: URLs/actions can contain one-time credentials.
  let serverLog = "";
  for (const stream of [server.stdout, server.stderr]) stream.on("data", (data) => { serverLog = (serverLog + data).slice(-150000); });
  let browser, context, guestSession, page;
  const errors = [];
  const checkpointAt = (value) => { checkpoint = value; console.log(`Checking: ${value}`); };
  const goto = async (page, path) => {
    let response = await page.goto(`${origin}${path}`, { waitUntil: "domcontentloaded", timeout: 120000 });
    if (response?.status() === 404) {
      await delay(500);
      response = await page.goto(`${origin}${path}`, { waitUntil: "domcontentloaded", timeout: 120000 });
    }
    return response;
  };
  async function mailLink(type) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const inbox = await (await fetch(`http://127.0.0.1:55324/api/v1/search?query=${encodeURIComponent(`to:${email}`)}`)).json();
      for (const message of inbox.messages ?? []) {
        const detail = await (await fetch(`http://127.0.0.1:55324/api/v1/message/${message.ID}`)).json();
        const links = (detail.HTML ?? "").match(/href="([^"]+)"/g) ?? [];
        for (const raw of links) {
          const value = raw.slice(6, -1).replaceAll("&amp;", "&");
          const url = new URL(value);
          if (url.origin === origin && url.pathname === "/auth/confirm" && url.searchParams.get("type") === type) return url.toString();
        }
      }
      await delay(250);
    }
    throw new Error("Expected local Auth email was not captured.");
  }
  try {
    checkpointAt("development server startup");
    let ready = false;
    for (let attempt = 0; attempt < 90; attempt++) {
      ready = await fetch(`${origin}/login`, { signal: AbortSignal.timeout(5000) }).then((response) => response.ok).catch(() => false);
      if (ready) break;
      if (server.exitCode !== null) throw new Error("Development server exited.");
      await delay(500);
    }
    assert.equal(ready, true);
    browser = await chromium.launch();
    context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    page = await context.newPage();
    page.setDefaultTimeout(45000);
    page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
    page.on("console", (message) => {
      if (message.type() === "error" && !/^Failed to load resource: the server responded with a status of 404/.test(message.text())) {
        errors.push(`console: ${message.text()}`);
      }
    });
    page.on("response", (response) => {
      const path = new URL(response.url()).pathname;
      // Vercel injects this endpoint in deployments; standalone `next start` has no collector.
      if (response.status() >= 400 && path !== "/_vercel/insights/script.js") errors.push(`response ${response.status()}: ${path}`);
    });
    checkpointAt("desktop rendering and protected account route");
    await goto(page, "/account");
    await expect(page).toHaveURL(/\/login\?next=/);
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
    assert.equal(await page.locator("[data-nextjs-dialog]").count(), 0);
    await mkdir("test-results/account-browser", { recursive: true });
    await page.screenshot({ path: "test-results/account-browser/login-desktop.png", fullPage: true });
    checkpointAt("separate guest cart and quote baskets");
    for (const [destination, quantity] of [["Cart", 2], ["Quote", 3]]) {
      checkpointAt(`separate guest baskets: ${destination}`);
      await goto(page, "/quick-order");
      await page.getByLabel("SKU 1", { exact: true }).fill("DA-A4-80-500");
      await page.getByLabel("Quantity 1", { exact: true }).fill(String(quantity));
      await page.getByRole("button", { name: `Add all to ${destination}` }).click();
      await expect(page.getByRole("heading", { name: destination === "Cart" ? "Cart" : "Quote list", exact: true })).toBeVisible();
    }
    guestSession = (await context.cookies()).find((cookie) => cookie.name === "ps_sid")?.value;
    assert.ok(guestSession);
    checkpointAt("registration and actual captured confirmation link");
    await goto(page, "/register");
    await page.getByLabel("Full name", { exact: true }).fill("Ama Browser");
    await page.getByLabel("Phone (optional)").fill("0241234567");
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Create account", exact: true }).click();
    await expect(page.getByRole("status")).toContainText("Check your email");
    const confirmation = await mailLink("email");
    let confirmationHeaders;
    page.on("response", (response) => {
      if (new URL(response.url()).pathname === "/auth/confirm") confirmationHeaders = response.headers();
    });
    await page.goto(confirmation, { waitUntil: "domcontentloaded", timeout: 120000 });
    await expect(page).toHaveURL(`${origin}/account`);
    await expect(page.getByRole("heading", { name: "Account", exact: true })).toBeVisible();
    assert.match(confirmationHeaders["cache-control"], /no-store/);
    assert.equal(confirmationHeaders["referrer-policy"], "no-referrer");
    assert.equal(new URL(page.url()).search, "");
    await expect(page.getByRole("button", { name: "Cart, 2 items" }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Quote list, 3 items" }).first()).toBeVisible();
    checkpointAt("Ghana address creation and checkout prefill");
    await goto(page, "/account/addresses");
    await expect(page.locator("form[data-hydrated=true]")).toBeVisible({ timeout: 45000 });
    await page.getByLabel(/Full Name/).fill("Ama Browser");
    await page.getByLabel(/Phone Number/).fill("0241234567");
    await page.getByLabel(/^Region/).fill("Greater Accra");
    await page.getByLabel(/City \/ Town/).fill("Accra");
    await page.getByLabel(/GhanaPost GPS/).fill("GA-123-4567");
    const invalidFields = await page.getByRole("button", { name: "Save address", exact: true }).evaluate((button) => Array.from(button.form?.querySelectorAll(":invalid") ?? []).map((field) => field.getAttribute("name")));
    console.log(`Browser-native invalid address fields: ${invalidFields.join(",") || "none"}`);
    assert.deepEqual(invalidFields, [], `Browser-native invalid address fields: ${invalidFields.join(",")}`);
    await page.getByRole("button", { name: "Save address", exact: true }).click({ force: true });
    await expect(page.getByRole("status")).toContainText("Address saved", { timeout: 45000 });
    await goto(page, "/checkout");
    await expect(page.getByLabel("Full Name")).toHaveValue("Ama Browser");
    await expect(page.getByLabel("GhanaPost GPS")).toHaveValue("GA-123-4567");
    await expect(page.getByLabel("Email")).toHaveValue(email);
    await page.getByRole("button", { name: "Place order", exact: true }).click();
    await expect(page).toHaveURL(/\/order\//, { timeout: 45000 });
    const orderPath = new URL(page.url()).pathname;
    await page.getByRole("button", { name: "Pay with Paystack" }).click();
    await expect(page).toHaveURL(/\/pay\/mock\//, { timeout: 45000 });
    await expect(page.getByRole("button", { name: "Simulate successful payment" })).toBeVisible();
    checkpointAt("saved organisation and explicit account RFQ sharing");
    await goto(page, "/account/organisation");
    await page.getByLabel("Organisation name").fill(organizationName);
    await page.getByRole("button", { name: "Save organisation" }).click();
    await expect(page.getByRole("status")).toContainText("Organisation saved");
    await goto(page, "/request-quote");
    await expect(page.getByLabel("Organisation name")).toHaveValue(organizationName);
    await page.getByRole("checkbox", { name: /Use my saved organisation/ }).check();
    await page.getByRole("button", { name: "Submit RFQ" }).click();
    await expect(page.getByRole("heading", { name: /RFQ .* received/ })).toBeVisible();
    await page.getByRole("link", { name: "View this quotation" }).click();
    const quotePath = new URL(page.url()).pathname;
    await expect(page.getByRole("main")).toContainText("submitted");
    checkpointAt("mobile account navigation and histories");
    await page.setViewportSize({ width: 390, height: 844 });
    await goto(page, "/account/orders");
    await expect(page.getByRole("main").getByRole("link", { name: /PSO-/ }).first()).toBeVisible();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
    await page.screenshot({ path: "test-results/account-browser/account-mobile.png", fullPage: true });
    checkpointAt("global sign-out, stale guest isolation and recovery email");
    await goto(page, "/account");
    await page.getByRole("button", { name: "Sign out", exact: true }).click();
    await expect(page).toHaveURL(`${origin}/login`);
    await goto(page, "/cart");
    await expect(page.getByText(/Your cart is empty/)).toBeVisible();
    assert.equal((await context.request.get(`${origin}${orderPath}`)).status(), 404);
    assert.equal((await context.request.get(`${origin}${quotePath}`)).status(), 404);
    await goto(page, "/forgot-password");
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByRole("button", { name: "Send reset link" }).click();
    await expect(page.getByRole("status")).toContainText("If an account exists");
    await page.goto(await mailLink("recovery"), { waitUntil: "domcontentloaded", timeout: 120000 });
    await expect(page).toHaveURL(`${origin}/reset-password`);
    await page.getByLabel("Password", { exact: true }).fill(newPassword);
    await page.getByLabel("Confirm password", { exact: true }).fill(newPassword);
    await page.getByRole("button", { name: "Update password" }).click();
    await expect(page.getByRole("status")).toContainText("password has been updated");
    await goto(page, "/account");
    await page.getByRole("button", { name: "Sign out", exact: true }).click();
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Password", { exact: true }).fill(newPassword);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(`${origin}/account`);
    await expect(page.getByRole("heading", { name: "Account", exact: true })).toBeVisible();
    assert.equal(serverLog.includes(password), false, "Passwords must not appear in dev logs");
    assert.equal(serverLog.includes(new URL(confirmation).searchParams.get("token_hash")), false, "Confirmation secrets must not appear in dev logs");
    assert.deepEqual(errors, []);
    console.log("PASS: real email confirmation/recovery, SSR cookies, basket merge, address, organisation, checkout/payment init, RFQ, histories, sign-out, mobile/desktop and console checks.");
  } catch (error) {
    const path = page ? new URL(page.url()).pathname : "no-page";
    const visible = page ? (await page.locator("main").innerText().catch(() => "no-main")).slice(0, 500) : "no-page";
    const [fixtureProfile] = await db`select id from profiles where email=${email}`;
    const addressCount = fixtureProfile ? (await db`select count(*)::int as count from addresses where owner_profile_id=${fixtureProfile.id}`)[0].count : -1;
    const safeLog = serverLog.split(/\r?\n/).map((line) => line
      .replaceAll(email, "[fixture-email]").replaceAll(password, "[password]").replaceAll(newPassword, "[password]")
      .replace(/token_hash=[^&\s]+/g, "token_hash=[redacted]")).slice(-40).join(" | ");
    const safeErrors = errors.join(" | ").replaceAll(email, "[fixture-email]").replace(/token_hash=[^&\s]+/g, "token_hash=[redacted]");
    const safeFailure = error instanceof Error ? error.message.replaceAll(email, "[fixture-email]").replace(/token_hash=[^&\s]+/g, "token_hash=[redacted]") : "unknown failure";
    console.error(`Browser evidence at ${path}; address rows=${addressCount}; failure=${safeFailure}: ${visible.replace(/\s+/g, " ")} Browser errors: ${safeErrors} ${safeLog}`);
    throw error;
  } finally {
    await browser?.close();
    if (server.pid && server.exitCode === null) {
      if (process.platform === "win32") await promisify(execFile)("taskkill", ["/PID", String(server.pid), "/T", "/F"], { windowsHide: true }).catch(() => {});
      else server.kill("SIGTERM");
    }
    const [profile] = await db`select id from profiles where email=${email}`;
    await db.begin(async (sql) => {
      if (profile) {
        await sql`delete from payments where order_id in (select id from orders where profile_id=${profile.id})`;
        await sql`delete from orders where profile_id=${profile.id}`;
        await sql`delete from quotes where profile_id=${profile.id}`;
        await sql`delete from carts where profile_id=${profile.id}`;
        await sql`delete from profiles where id=${profile.id} and email=${email}`;
      }
      if (guestSession) {
        await sql`delete from quotes where session_id=${guestSession} and profile_id is null`;
        await sql`delete from carts where session_id=${guestSession} and profile_id is null`;
      }
      await sql`delete from organizations where name=${organizationName}`;
      await sql`delete from auth.users where email=${email}`;
    });
    await db.end({ timeout: 5 });
    console.log("Removed only this run's fixtures; stopped its own dev server.");
  }
}
main().catch(() => { console.error(`Account browser test failed at: ${checkpoint}. Credential-bearing diagnostics were not printed.`); process.exitCode = 1; });
