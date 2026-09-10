/**
 * Hosted browser journeys must opt into a known, production-safe fixture.
 * Local runs keep the seeded catalogue defaults for backwards compatibility.
 */
export const catalogueSku = process.env.E2E_CATALOGUE_SKU?.trim() || "DA-A4-80-500";
export const catalogueSlug =
  process.env.E2E_CATALOGUE_SLUG?.trim() || "double-a-premium-a4";
export const catalogueName =
  process.env.E2E_CATALOGUE_NAME?.trim() || "Double A Premium A4 Paper";

// A fixture must be explicitly selected for any journey that mutates baskets,
// orders, or quotes on hosted targets. Local runs use the seeded catalogue
// defaults, so they should exercise the full stateful suite.
const baseUrl = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";
const localTarget = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/i.test(baseUrl);
export const hostedFixtureMissing = !localTarget && !process.env.E2E_CATALOGUE_SKU;
// Quick Order assertions depend on exact tier/stock data, so require an
// explicit SKU even for local runs where the database may contain other data.
export const quickOrderFixtureMissing = !process.env.E2E_CATALOGUE_SKU;
