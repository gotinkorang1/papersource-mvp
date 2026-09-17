import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MobileMenu } from "./mobile-menu";

vi.mock("next/navigation", () => ({
  usePathname: () => "/shop",
}));

describe("MobileMenu", () => {
  beforeEach(() => {
    document.body.style.overflow = "";
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
});
