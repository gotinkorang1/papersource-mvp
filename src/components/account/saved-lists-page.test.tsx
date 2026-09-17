import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SavedListsPage from "@/app/(account)/account/lists/page";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/customer/require", () => ({ requireCustomer: async () => ({ profileId: "profile-1", fullName: "Ama", email: "ama@example.test", phone: null }) }));
vi.mock("@/features/saved-lists/repository", () => ({
  listSavedLists: async () => [{ id: "list-1", name: "Monthly supplies", description: "Office basics", ownerProfileId: "profile-1", organizationId: null, organizationName: null, itemCount: 3, createdAt: new Date("2026-01-01"), updatedAt: new Date("2026-01-02") }],
}));

describe("saved lists account page", () => {
  it("shows list creation and existing saved-list actions", async () => {
    render(await SavedListsPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByRole("heading", { name: "Saved lists", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create list" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Monthly supplies" })).toHaveAttribute("href", "/account/lists/list-1");
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });
});
