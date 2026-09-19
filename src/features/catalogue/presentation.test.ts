import { describe, expect, it } from "vitest";
import { isProductNew } from "./presentation";

describe("product freshness", () => {
  const now = new Date("2026-09-19T12:00:00.000Z");

  it("marks products inside seven days as new but not the boundary", () => {
    expect(isProductNew(new Date("2026-09-12T12:00:01.000Z"), now)).toBe(true);
    expect(isProductNew(new Date("2026-09-12T12:00:00.000Z"), now)).toBe(false);
    expect(isProductNew(new Date("2026-09-12T11:59:59.000Z"), now)).toBe(false);
  });

  it("rejects future, invalid, and missing creation dates", () => {
    expect(isProductNew(new Date("2026-09-20T00:00:00.000Z"), now)).toBe(false);
    expect(isProductNew("not-a-date", now)).toBe(false);
    expect(isProductNew(null, now)).toBe(false);
    expect(isProductNew(undefined, now)).toBe(false);
  });
});
