import { describe, expect, it } from "vitest";
import { mergeSavedListQuantity, normalizeSavedListQuantity, validateSavedListName } from "./validation";

describe("saved list validation", () => {
  it("normalizes names and rejects blank or oversized names", () => {
    expect(validateSavedListName("  Weekly supplies  ")).toBe("Weekly supplies");
    expect(() => validateSavedListName(" ")).toThrow("name");
    expect(() => validateSavedListName("x".repeat(121))).toThrow("name");
  });

  it("accepts positive whole quantities and merges duplicate quantities safely", () => {
    expect(normalizeSavedListQuantity("3")).toBe(3);
    expect(mergeSavedListQuantity(3, 2)).toBe(5);
    expect(() => normalizeSavedListQuantity("0")).toThrow("quantity");
    expect(() => normalizeSavedListQuantity("1.5")).toThrow("quantity");
  });
});
