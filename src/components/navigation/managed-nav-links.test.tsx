import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ManagedNavLinks } from "./managed-nav-links";

let currentPathname = "/shop";

vi.mock("next/navigation", () => ({
  usePathname: () => currentPathname,
}));

describe("ManagedNavLinks", () => {
  beforeEach(() => {
    currentPathname = "/shop";
  });

  it("marks nested and trailing-slash routes active", () => {
    render(<ManagedNavLinks links={[{ label: "Shop", href: "/shop/" }, { label: "About", href: "/about" }]} />);

    expect(screen.getByRole("link", { name: "Shop" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "About" })).not.toHaveAttribute("aria-current");
  });

  it("does not mark the root link active on a nested route", () => {
    currentPathname = "/shop";
    render(<ManagedNavLinks links={[{ label: "Home", href: "/" }, { label: "Shop", href: "/shop" }]} />);

    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "Shop" })).toHaveAttribute("aria-current", "page");
  });
});
