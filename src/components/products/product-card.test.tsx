import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { render, screen } from "@testing-library/react";
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
});
