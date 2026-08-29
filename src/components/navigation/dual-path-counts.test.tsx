import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CartDrawer } from "@/components/commerce/cart-drawer";
import { DualPathCounts } from "@/components/navigation/dual-path-counts";
import { ProductCard } from "@/components/products/product-card";
import { QuoteBasket } from "@/components/quotes/quote-basket";
import { DualPathPreviewProvider } from "@/features/preview/dual-path-preview";
import { sampleProducts } from "@/lib/design-system/fixtures";

function Preview() {
  return (
    <DualPathPreviewProvider>
      <DualPathCounts />
      <ProductCard product={sampleProducts[0]} />
      <QuoteBasket />
      <CartDrawer />
    </DualPathPreviewProvider>
  );
}

describe("dual-path counts", () => {
  it("keeps cart and quote counts independent", async () => {
    const user = userEvent.setup();
    render(<Preview />);

    expect(screen.getByLabelText("Quote list, 0 items")).toBeInTheDocument();
    expect(screen.getByLabelText("Cart, 0 items")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Add to Quote" }));

    expect(screen.getByRole("heading", { name: "Quote list" })).toBeInTheDocument();
    expect(screen.getByText(/Procurement basket/)).toBeInTheDocument();
    expect(screen.getByLabelText("Quote list, 1 item")).toBeInTheDocument();
    expect(screen.getByLabelText("Cart, 0 items")).toBeInTheDocument();
  });
});
