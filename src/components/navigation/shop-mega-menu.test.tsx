import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ShopMegaMenu } from "./shop-mega-menu";

vi.mock("next/navigation", () => ({
  usePathname: () => "/shop",
}));

describe("ShopMegaMenu", () => {
  const columns = [{ title: "Categories", links: [{ label: "Paper", href: "/shop/paper" }] }];

  it("opens and focuses the first category with Arrow Down", async () => {
    render(<ShopMegaMenu columns={columns} />);
    const trigger = screen.getByRole("button", { name: /shop/i });

    fireEvent.keyDown(trigger, { key: "ArrowDown" });

    await waitFor(() => expect(screen.getByRole("menuitem", { name: "Paper" })).toHaveFocus());
  });

  it("closes and restores focus with Escape", async () => {
    render(<ShopMegaMenu columns={columns} />);
    const trigger = screen.getByRole("button", { name: /shop/i });
    fireEvent.click(trigger);
    const item = screen.getByRole("menuitem", { name: "Paper" });
    item.focus();

    fireEvent.keyDown(item, { key: "Escape" });

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
