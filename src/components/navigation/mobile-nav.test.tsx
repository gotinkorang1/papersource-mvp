import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MobileNav } from "./mobile-nav";

let currentPathname = "/quote/example-token";

vi.mock("next/navigation", () => ({
  usePathname: () => currentPathname,
}));

vi.mock("@/features/preview/dual-path-preview", () => ({
  useDualPathPreview: () => ({
    cartLines: [],
    quoteLines: [],
    cartOpen: false,
    quoteOpen: false,
    setCartOpen: vi.fn(),
    setQuoteOpen: vi.fn(),
  }),
}));

describe("MobileNav", () => {
  beforeEach(() => {
    currentPathname = "/quote/example-token";
  });

  it("keeps the quote tab active on nested quote routes", () => {
    render(<MobileNav />);

    expect(screen.getByRole("button", { name: /quote list/i })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: /cart/i })).not.toHaveAttribute("aria-current");
  });

  it("keeps the cart tab active on checkout routes", () => {
    currentPathname = "/checkout/confirm";
    render(<MobileNav />);

    expect(screen.getByRole("button", { name: /cart/i })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: /quote list/i })).not.toHaveAttribute("aria-current");
  });
});
