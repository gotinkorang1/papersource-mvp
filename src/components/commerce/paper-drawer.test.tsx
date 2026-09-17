import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PaperDrawer } from "./paper-drawer";

describe("PaperDrawer", () => {
  it("keeps focus stable when the parent rerenders while open", () => {
    const onClose = vi.fn();
    const view = render(
      <PaperDrawer open title="Cart" description="Items" onClose={onClose}>
        <button type="button">Item action</button>
      </PaperDrawer>,
    );

    const close = within(screen.getByRole("dialog", { name: "Cart" })).getByRole("button", { name: "Close Cart" });
    expect(close).toHaveFocus();

    view.rerender(
      <PaperDrawer open title="Cart" description="Updated items" onClose={() => onClose()}>
        <button type="button">Item action</button>
      </PaperDrawer>,
    );

    expect(close).toHaveFocus();
  });

  it("restores focus only after closing", () => {
    const trigger = document.createElement("button");
    trigger.textContent = "Open cart";
    document.body.append(trigger);
    trigger.focus();
    const onClose = vi.fn();
    const view = render(
      <PaperDrawer open title="Cart" description="Items" onClose={onClose}>
        <p>Items</p>
      </PaperDrawer>,
    );

    expect(within(screen.getByRole("dialog", { name: "Cart" })).getByRole("button", { name: "Close Cart" })).toHaveFocus();
    view.rerender(<PaperDrawer open={false} title="Cart" description="Items" onClose={() => undefined}>{null}</PaperDrawer>);
    expect(trigger).toHaveFocus();
    trigger.remove();
  });
});
