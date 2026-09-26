import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductListItem } from "@/components/products/product-list-item";
import { sampleProducts } from "@/lib/design-system/fixtures";

vi.mock("server-only", () => ({}));

describe("ProductListItem", () => {
  it("keeps content-mode product context visible on mobile", () => {
    render(<ProductListItem product={sampleProducts[0]} variant="content" />);

    const context = screen.getByText(
      "A4 • 80gsm • 500 sheets. Available with clear pricing, stock visibility, and delivery support across Accra and Tema.",
    );

    expect(context).not.toHaveClass("hidden");
    expect(context).toHaveClass("line-clamp-3");
  });

  it("matches the mobile image sizing hint to the selected presentation", () => {
    const { rerender } = render(<ProductListItem product={sampleProducts[0]} variant="list" />);
    const listImage = screen.getByRole("img", { name: /Double A Premium A4 paper/ });
    expect(listImage).toHaveAttribute("sizes", "(max-width: 640px) 88px, 128px");
    expect(listImage).toHaveClass("object-cover");

    rerender(<ProductListItem product={sampleProducts[0]} variant="content" />);
    const contentImage = screen.getByRole("img", { name: /Double A Premium A4 paper/ });
    expect(contentImage).toHaveAttribute("sizes", "(max-width: 640px) 104px, 192px");
  });

  it("does not describe an out-of-stock product as available", () => {
    render(<ProductListItem product={{ ...sampleProducts[0], stock: "out" }} variant="content" />);

    expect(screen.getByText(/Currently out of stock/)).toBeInTheDocument();
  });

  it("falls back to a local image when a remote thumbnail fails", () => {
    render(<ProductListItem product={{ ...sampleProducts[0], imageSrc: "https://cdn.example.invalid/product.jpg" }} />);

    const image = screen.getByRole("img", { name: /Double A Premium A4 paper/ });
    fireEvent.error(image);

    expect(image).toHaveAttribute("src", expect.stringContaining("set-school-stationery.jpg"));
  });

  it("confirms cart and quote additions in list view", async () => {
    const user = userEvent.setup();
    const addToCart = vi.fn();
    const addToQuote = vi.fn();
    render(<ProductListItem product={sampleProducts[0]} onAddToCart={addToCart} onAddToQuote={addToQuote} />);

    const cartButton = screen.getByRole("button", { name: "Add to Cart" });
    const quoteButton = screen.getByRole("button", { name: "Add to Quote" });
    expect(cartButton).toHaveClass("min-h-11");
    expect(quoteButton).toHaveClass("min-h-11");
    await user.click(cartButton);
    expect(addToCart).toHaveBeenCalledWith(sampleProducts[0], 1);
    expect(screen.getByRole("button", { name: "Added to Cart" })).toHaveTextContent("Added");
    expect(screen.getByRole("status")).toHaveTextContent("Added to cart.");

    await user.click(quoteButton);
    expect(addToQuote).toHaveBeenCalledWith(sampleProducts[0], 1);
    expect(screen.getByRole("button", { name: "Added to Quote" })).toHaveTextContent("Added");
    expect(screen.getByRole("status")).toHaveTextContent("Added to quote list.");
  });
});
