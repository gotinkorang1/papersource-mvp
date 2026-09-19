import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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
});
