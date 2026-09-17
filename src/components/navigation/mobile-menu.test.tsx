import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MobileMenu } from "./mobile-menu";

let currentPathname = "/shop";

vi.mock("next/navigation", () => ({
  usePathname: () => currentPathname,
}));

describe("MobileMenu", () => {
  beforeEach(() => {
    document.body.style.overflow = "";
    currentPathname = "/shop";
  });

  it("locks page scrolling while open and restores it when closed with Escape", () => {
    render(<MobileMenu />);
    const trigger = screen.getByRole("button", { name: "Open menu" });

    fireEvent.click(trigger);
    expect(document.body.style.overflow).toBe("hidden");
    expect(screen.getByRole("dialog", { name: "Menu" })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(document.body.style.overflow).toBe("");
    expect(screen.queryByRole("dialog", { name: "Menu" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open menu" })).toHaveFocus();
  });

  it("moves focus into the menu and wraps Tab at its edges", async () => {
    render(<MobileMenu />);
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    const first = screen.getByRole("link", { name: "Shop all products" });
    const last = screen.getByRole("link", { name: "Business accounts" });
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(first).toHaveFocus();
    fireEvent.keyDown(window, { key: "Tab", shiftKey: true });
    expect(last).toHaveFocus();
  });

  it("closes when the current route changes", () => {
    const view = render(<MobileMenu />);
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    expect(screen.getByRole("dialog", { name: "Menu" })).toBeInTheDocument();

    currentPathname = "/about";
    view.rerender(<MobileMenu />);

    expect(screen.queryByRole("dialog", { name: "Menu" })).not.toBeInTheDocument();
  });
});
