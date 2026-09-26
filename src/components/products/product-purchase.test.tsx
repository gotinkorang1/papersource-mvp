import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProductPurchase } from "@/components/products/product-purchase";

vi.mock("@/features/preview/dual-path-preview", () => ({
  useDualPathPreview: () => ({ addToCart: vi.fn(), addToQuote: vi.fn() }),
}));

const product = {
  id: "product-1",
  variantId: "variant-1",
  slug: "blue-pen",
  sku: "PEN-1",
  name: "Blue Pen",
  specLine: "Fine point",
  unitLabel: "each",
  unitPricePesewas: 500,
  imageAlt: "Blue Pen",
  stock: "in_stock" as const,
  tiers: [],
  deliveryBadge: { label: "Accra delivery", feeMode: "calculated" as const },
};

describe("product purchase", () => {
  it("offers a separate saved-list action when the customer has lists", () => {
    render(<ProductPurchase product={product} savedLists={[{ id: "list-1", name: "Monthly supplies" }]} />);

    expect(screen.getByLabelText("Save to list")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Monthly supplies" })).toBeInTheDocument();
    const saveButton = screen.getByRole("button", { name: "Save product" });
    expect(saveButton).toBeInTheDocument();
    expect(saveButton).toHaveClass("min-h-11");
    expect(saveButton).toHaveClass("focus-visible:outline-2");
  });
});
