import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProductEngagement } from "./product-engagement";

vi.mock("server-only", () => ({}));

describe("ProductEngagement", () => {
  it("announces successful link copying", async () => {
    const user = (await import("@testing-library/user-event")).default.setup();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    });

    render(<ProductEngagement productId="product-1" productName="Test product" reviews={[]} />);
    await user.click(screen.getByRole("button", { name: "Share product" }));

    expect(screen.getByRole("status")).toHaveTextContent("Product link copied to clipboard.");
  });

  it("falls back to copying when the native share sheet fails", async () => {
    const user = (await import("@testing-library/user-event")).default.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: vi.fn().mockRejectedValue(new Error("share unavailable")),
    });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    render(<ProductEngagement productId="product-1" productName="Test product" reviews={[]} />);
    await user.click(screen.getByRole("button", { name: "Share product" }));

    expect(writeText).toHaveBeenCalledWith(window.location.href);
    expect(screen.getByRole("status")).toHaveTextContent("Product link copied to clipboard.");
  });

  it("exposes the product rating as an accessible status", () => {
    render(
      <ProductEngagement
        productId="product-1"
        productName="Test product"
        reviews={[
          {
            id: "review-1",
            rating: 4,
            title: "Useful",
            body: "A helpful product.",
            displayName: "Customer",
            createdAt: new Date("2026-09-27"),
            verifiedPurchase: true,
          },
        ]}
      />,
    );

    expect(screen.getByRole("img", { name: "4.0 out of 5 stars" })).toBeInTheDocument();
  });
});
