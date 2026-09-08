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
// orders, or quotes. This prevents a stale SKU from producing misleading CI
// failures against a different hosted catalogue.
export const hostedFixtureMissing = !process.env.E2E_CATALOGUE_SKU;
