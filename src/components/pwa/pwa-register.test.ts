import { describe, expect, it } from "vitest";
import { isIosInstallable } from "./pwa-register";

describe("isIosInstallable", () => {
  it("recognizes iPhone Safari that is not already standalone", () => {
    expect(isIosInstallable({ platform: "iPhone", userAgent: "Version/17.0 Mobile Safari", standalone: false })).toBe(true);
    expect(isIosInstallable({ platform: "MacIntel", userAgent: "Safari", standalone: false })).toBe(false);
    expect(isIosInstallable({ platform: "iPad", userAgent: "CriOS/120.0 Mobile", standalone: false })).toBe(false);
    expect(isIosInstallable({ platform: "iPhone", userAgent: "Version/17.0 Mobile Safari", standalone: true })).toBe(false);
  });
});
