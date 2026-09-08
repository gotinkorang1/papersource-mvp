import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";
const isLocalTarget = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/i.test(baseURL);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  // E2E flows share the dedicated local database; serial execution prevents
  // cart/inventory fixtures from racing across browser workers.
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL,
    trace: "on-first-retry",
    actionTimeout: 30_000,
    navigationTimeout: 90_000,
  },
  timeout: 60_000,
  ...(isLocalTarget ? {
    webServer: {
      command: "pnpm dev",
      url: baseURL,
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
    },
  } : {}),
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
