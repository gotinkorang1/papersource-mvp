import { describe, expect, it } from "vitest";
import { desktopNavigation, mobileMenuLinks, isNavigationLinkActive } from "./navigation-model";

describe("storefront navigation model", () => {
  it("keeps the desktop primary row focused on the main shopping journeys", () => {
    expect(desktopNavigation.map((item) => item.label)).toEqual(["Shop", "Business", "About"]);
    expect(desktopNavigation.map((item) => item.href)).toEqual(["/shop", "/business", "/about"]);
  });

  it("puts important secondary destinations in the mobile menu", () => {
    expect(mobileMenuLinks.map((item) => item.label)).toEqual([
      "Brands",
      "Bulk Orders",
      "Quick Order",
      "Delivery",
      "Contact",
      "Account",
    ]);
  });

  it("recognizes nested catalogue routes without activating unrelated links", () => {
    expect(isNavigationLinkActive("/shop", "/shop/writing")).toBe(true);
    expect(isNavigationLinkActive("/about", "/about/team")).toBe(true);
    expect(isNavigationLinkActive("/shop", "/shopping-list")).toBe(false);
  });
});
