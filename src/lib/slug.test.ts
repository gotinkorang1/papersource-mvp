import { describe, expect, it } from "vitest";
import { slugify } from "./slug";

describe("slugify", () => {
  it("builds a shop slug from a product name", () => {
    expect(slugify("Double A A4 80gsm")).toBe("double-a-a4-80gsm");
  });

  it("rejects an empty name", () => {
    expect(() => slugify("   ")).toThrow(/slug/);
  });
});
