import { describe, expect, it } from "vitest";
import { FALLBACK_FAQS, FALLBACK_NAVIGATION } from "./fallbacks";

describe("content fallbacks", () => {
  it("keeps customer-facing FAQ coverage available", () => {
    expect(FALLBACK_FAQS.length).toBeGreaterThanOrEqual(5);
    expect(FALLBACK_FAQS[0]?.[0]).toBe("Can I buy as a guest?");
  });
  it("provides navigation for every responsive placement", () => {
    expect(FALLBACK_NAVIGATION.header.length).toBeGreaterThan(0);
    expect(FALLBACK_NAVIGATION.footer.length).toBeGreaterThan(0);
    expect(FALLBACK_NAVIGATION.mobile.length).toBe(5);
  });
});
