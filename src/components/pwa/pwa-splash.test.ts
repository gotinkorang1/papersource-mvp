import { describe, expect, it } from "vitest";
import { isStandaloneDisplayMode } from "./pwa-splash";

describe("isStandaloneDisplayMode", () => {
  it("recognizes installed standalone mode and iOS standalone mode", () => {
    expect(isStandaloneDisplayMode({ matches: true })).toBe(true);
    expect(isStandaloneDisplayMode({ matches: false, iosStandalone: true })).toBe(true);
    expect(isStandaloneDisplayMode({ matches: false, iosStandalone: false })).toBe(false);
  });
});
