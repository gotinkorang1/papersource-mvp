import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { ProductGrid } from "@/components/products/product-grid";

describe("ProductGrid", () => {
  it("switches to one column below 390px so compact card controls retain their touch targets", () => {
    const { container } = render(<ProductGrid><div>Product</div></ProductGrid>);
    const grid = container.firstElementChild;

    expect(grid).toHaveClass(
      "grid-cols-2",
      "max-[389px]:grid-cols-1",
      "gap-3",
      "sm:gap-4",
      "sm:grid-cols-2",
      "lg:grid-cols-3",
      "xl:grid-cols-4",
    );
  });
});
