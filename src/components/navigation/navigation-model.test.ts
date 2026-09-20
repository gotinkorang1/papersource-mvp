import { describe, expect, it } from "vitest";
import {
  desktopNavigation,
  mobileMenuLinks,
  isNavigationLinkActive,
  uniqueNavigationLinks,
} from "./navigation-model";

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

  it("removes duplicate destinations while preserving the first label", () => {
    expect(
      uniqueNavigationLinks([
        { label: "Brands", href: "/brands" },
        { label: "Our brands", href: "/brands" },
        { label: "Contact", href: "/contact" },
      ]),
    ).toEqual([
      { label: "Brands", href: "/brands" },
      { label: "Contact", href: "/contact" },
    ]);
  });

  it("normalizes managed labels and route slashes while ignoring empty records", () => {
    expect(
      uniqueNavigationLinks([
        { label: "  About us ", href: "/about/" },
        { label: "", href: "/empty" },
        { label: "Duplicate", href: "/about" },
        { label: "Contact", href: " /contact/ " },
      ]),
    ).toEqual([
      { label: "About us", href: "/about" },
      { label: "Contact", href: "/contact" },
    ]);
  });

  it("treats trailing slashes consistently for active routes", () => {
    expect(isNavigationLinkActive("/about/", "/about")).toBe(true);
    expect(isNavigationLinkActive("/about", "/about/team/")).toBe(true);
  });

  it("does not mark the home link active on every route", () => {
    expect(isNavigationLinkActive("/", "/")).toBe(true);
    expect(isNavigationLinkActive("/", "/shop")).toBe(false);
  });
});
