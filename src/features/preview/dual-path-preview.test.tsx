import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const actions = vi.hoisted(() => ({
  addToCart: vi.fn(),
  addToQuote: vi.fn(),
  clearCart: vi.fn(),
  clearQuote: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/features/preview/actions", () => ({
  addToCartAction: actions.addToCart,
  addToQuoteAction: actions.addToQuote,
  clearCartAction: actions.clearCart,
  clearQuoteAction: actions.clearQuote,
}));

import { DualPathPreviewProvider, useDualPathPreview } from "./dual-path-preview";

const cartLine = {
  id: "variant-1",
  name: "A4 paper",
  specLine: "80gsm",
  quantity: 1,
  unitPricePesewas: 2500,
  unitLabel: "ream",
};

function CartClearHarness() {
  const { cartLines, clearCart, syncError } = useDualPathPreview();
  return <><p>{cartLines.length ? cartLines[0].name : "Cart is empty"}</p><button type="button" onClick={clearCart}>Clear cart</button>{syncError ? <p role="alert">{syncError}</p> : null}</>;
}

describe("DualPathPreviewProvider", () => {
  it("restores cart items when a persisted clear fails", async () => {
    let rejectClear!: (error: Error) => void;
    actions.clearCart.mockImplementationOnce(() => new Promise((_, reject) => { rejectClear = reject; }));
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const user = userEvent.setup();
    render(<DualPathPreviewProvider persist initialCartLines={[cartLine]}><CartClearHarness /></DualPathPreviewProvider>);

    await user.click(screen.getByRole("button", { name: "Clear cart" }));
    expect(screen.getByText("Cart is empty")).toBeInTheDocument();

    rejectClear(new Error("network failed"));
    expect(await screen.findByRole("alert")).toHaveTextContent("could not be cleared");
    await waitFor(() => expect(screen.getByText("A4 paper")).toBeInTheDocument());
    consoleError.mockRestore();
  });
});
