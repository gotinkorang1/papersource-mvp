import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SavedListDetailPage from "@/app/(account)/account/lists/[id]/page";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/customer/require", () => ({
  requireCustomer: async () => ({ profileId: "owner", fullName: "Ama", email: "ama@example.test", phone: "0241234567" }),
}));
vi.mock("@/features/saved-lists/repository", () => ({
  getSavedList: async () => ({
    id: "list-1",
    name: "Monthly supplies",
    description: "Office basics",
    ownerProfileId: "owner",
    organizationId: null,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-02T00:00:00Z"),
    items: [
      {
        id: "item-1",
        variantId: "variant-1",
        quantity: 2,
        note: "Blue ink only",
        productName: "Premium Ballpoint Pen",
        sku: "PEN-BLU-01",
        productSlug: "premium-ballpoint-pen",
        productActive: true,
        variantActive: true,
      },
      {
        id: "item-2",
        variantId: "variant-2",
        quantity: 1,
        note: null,
        productName: "Archived Notebook",
        sku: "NOTE-OLD-01",
        productSlug: "archived-notebook",
        productActive: false,
        variantActive: false,
      },
    ],
  }),
}));

describe("saved list detail page", () => {
  it("shows saved items and makes unavailable products explicit", async () => {
    render(await SavedListDetailPage({ params: Promise.resolve({ id: "list-1" }) }));

    expect(screen.getByRole("heading", { name: "Monthly supplies", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Browse products" })).toHaveAttribute("href", "/shop");
    expect(screen.getByRole("link", { name: "Premium Ballpoint Pen" })).toHaveAttribute("href", "/product/premium-ballpoint-pen");
    expect(screen.getByText("Premium Ballpoint Pen")).toBeInTheDocument();
    expect(screen.getByText("Blue ink only")).toBeInTheDocument();
    expect(screen.getByText("Unavailable — remove or replace this item before reordering.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add available to Cart" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add available to Quote" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Remove" })).toHaveLength(2);
  });
});
