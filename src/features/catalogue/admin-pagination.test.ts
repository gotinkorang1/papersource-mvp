import { describe, expect, it } from "vitest";
import { normaliseAdminProductPage, resolveAdminProductPage } from "./admin-pagination";

describe("admin product pagination", () => {
  it("normalises invalid and fractional page values to a safe positive page", () => {
    expect(normaliseAdminProductPage(undefined)).toBe(1);
    expect(normaliseAdminProductPage("0")).toBe(1);
    expect(normaliseAdminProductPage("2.8")).toBe(2);
    expect(normaliseAdminProductPage("not-a-page")).toBe(1);
  });

  it("clamps a stale page request to the final available page", () => {
    expect(resolveAdminProductPage("99", 51)).toBe(2);
    expect(resolveAdminProductPage("99", 0)).toBe(1);
  });
});
