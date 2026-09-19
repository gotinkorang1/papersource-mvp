import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AdminProductsView, type AdminProductListRow } from "./admin-products-view";

const rows: AdminProductListRow[] = [{
  id: "product-1",
  name: "A4 Premium Paper",
  brandName: "Double A",
  categoryName: "Paper",
  productType: "standard",
  status: "active",
  isNew: true,
  imageCount: 3,
  isTrending: true,
  viewCount: 18,
}];

describe("AdminProductsView", () => {
  it("keeps bulk selection in the default table and exposes catalogue metadata", () => {
    render(<AdminProductsView rows={rows} canWrite />);

    expect(screen.getByRole("table", { name: "Catalogue products" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Select all products" })).toBeInTheDocument();
    expect(screen.getByText("New")).toBeInTheDocument();
    expect(screen.getByText("Trending · 18")).toBeInTheDocument();
    expect(screen.getByText("3 · Manage images")).toBeInTheDocument();
  });

  it("switches to a responsive edit-focused presentation", () => {
    render(<AdminProductsView rows={rows} canWrite />);

    fireEvent.click(screen.getByRole("button", { name: "Grid" }));

    expect(document.querySelector('[data-catalogue-view="grid"]')).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Select all products" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Edit product" })).toHaveAttribute("href", "/admin/products/product-1");
    expect(screen.getByRole("link", { name: "Manage images" })).toHaveAttribute("href", "/admin/products/product-1#images");
  });

  it("does not expose write controls to read-only staff", () => {
    render(<AdminProductsView rows={rows} canWrite={false} />);

    expect(screen.queryByRole("button", { name: "Apply to selected" })).not.toBeInTheDocument();
    expect(screen.queryByRole("checkbox", { name: /Select/ })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Edit product" })).toBeInTheDocument();
  });
});
