import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductCard } from "@/components/products/product-card";
import { sampleProducts } from "@/lib/design-system/fixtures";

const product = sampleProducts[0];

describe("ProductCard", () => {
  it("shows spec, unit price, tier hint, stock, and both CTAs", () => {
    render(<ProductCard product={product} />);

    expect(screen.getByText("Double A Premium A4 Paper")).toBeInTheDocument();
    expect(screen.getByText("A4 • 80gsm • 500 sheets")).toBeInTheDocument();
    expect(screen.getByText("GHS 78.00")).toBeInTheDocument();
    expect(screen.getByText("Request bulk price")).toBeInTheDocument();
    expect(screen.getByText(/In stock/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add to Cart" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add to Quote" }),
    ).toBeInTheDocument();
  });

  it("does not call cart when adding to quote", async () => {
    const user = userEvent.setup();
    const onAddToCart = vi.fn();
    const onAddToQuote = vi.fn();

    render(
      <ProductCard
        product={product}
        onAddToCart={onAddToCart}
        onAddToQuote={onAddToQuote}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Add to Quote" }));

    expect(onAddToQuote).toHaveBeenCalledTimes(1);
    expect(onAddToCart).not.toHaveBeenCalled();
  });

  it("keeps quote requests available when stock is out", () => {
    render(<ProductCard product={{ ...product, stock: "out" }} />);

    expect(screen.getByRole("button", { name: "Add to Cart" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Add to Quote" })).toBeEnabled();
  });

  it("uses compact card metadata and explicit responsive CTA labels", () => {
    const longSkuProduct = {
      ...product,
      sku: "A-VERY-LONG-SKU-THAT-MUST-STAY-ON-ONE-LINE",
      specLine: "",
    };

    const { container } = render(<ProductCard product={longSkuProduct} />);
    const sku = screen.getByText(`SKU ${longSkuProduct.sku}`);
    const cart = screen.getByRole("button", { name: "Add to Cart" });
    const quote = screen.getByRole("button", { name: "Add to Quote" });

    expect(container.querySelector("p.line-clamp-2")).not.toBeInTheDocument();
    expect(sku).toHaveClass("truncate");
    expect(cart).toHaveAttribute("aria-label", "Add to Cart");
    expect(quote).toHaveAttribute("aria-label", "Add to Quote");
    expect(cart).toHaveClass("min-h-11");
    expect(quote).toHaveClass("min-h-11");
    expect(container.querySelector(".sm\\:hidden")).toHaveTextContent("Cart");
    expect(container.querySelectorAll(".hidden.sm\\:inline")[0]).toHaveTextContent("Add to Cart");
    expect(container.querySelectorAll(".hidden.sm\\:inline")[1]).toHaveTextContent("Add to Quote");
  });

  it("requests full-width imagery when the narrow mobile grid collapses to one column", () => {
    render(<ProductCard product={product} />);

    expect(screen.getByRole("img", { name: /Double A Premium A4 paper/ })).toHaveAttribute(
      "sizes",
      "(max-width: 389px) 100vw, (max-width: 640px) 50vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw",
    );
  });

  it("uses the same responsive dual-path labels in quick view", async () => {
    const user = userEvent.setup();
    render(<ProductCard product={product} />);

    await user.click(screen.getByRole("button", { name: "Quick view" }));
    const dialog = screen.getByRole("dialog");
    const cart = within(dialog).getByRole("button", { name: "Add to Cart" });
    const quote = within(dialog).getByRole("button", { name: "Add to Quote" });

    expect(cart).toHaveAttribute("aria-label", "Add to Cart");
    expect(quote).toHaveAttribute("aria-label", "Add to Quote");
    expect(within(cart).getByText("Cart")).toBeInTheDocument();
    expect(within(quote).getByText("Quote")).toBeInTheDocument();
    expect(within(cart).getByText("Add to Cart")).toBeInTheDocument();
    expect(within(quote).getByText("Add to Quote")).toBeInTheDocument();
  });

  it("closes quick view with Escape and restores focus to its trigger", async () => {
    const user = userEvent.setup();
    const { container } = render(<ProductCard product={product} />);
    const trigger = screen.getByRole("button", { name: "Quick view" });

    await user.click(trigger);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(container.ownerDocument.activeElement).toBe(trigger);
  });

  it("resets quick-view quantity when reopened", async () => {
    const user = userEvent.setup();
    render(<ProductCard product={product} />);

    await user.click(screen.getByRole("button", { name: "Quick view" }));
    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Increase quantity" }));
    expect(within(dialog).getByRole("spinbutton", { name: "Quantity" })).toHaveValue(2);
    await user.click(within(dialog).getByRole("button", { name: "Close quick view" }));
    await user.click(screen.getByRole("button", { name: "Quick view" }));
    expect(within(screen.getByRole("dialog")).getByRole("spinbutton", { name: "Quantity" })).toHaveValue(1);
  });

  it("shows freshness and trending badges when the catalogue marks them", () => {
    render(<ProductCard product={{ ...product, isNew: true, isTrending: true, viewCount: 12 }} />);

    expect(screen.getByText("New")).toBeInTheDocument();
    expect(screen.getByText("Trending · 12")).toBeInTheDocument();
  });
});
