import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AddressesPage from "@/app/(account)/account/addresses/page";
import OrganisationPage from "@/app/(account)/account/organisation/page";
import QuotesPage from "@/app/(account)/account/quotes/page";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/customer/require", () => ({ requireCustomer: async () => ({ profileId: "owner", fullName: "Ama", email: "ama@example.test", phone: "0241234567" }) }));
vi.mock("@/features/account/addresses", () => ({ listCustomerAddresses: async () => [{ id: "address-1", fullName: "Ama", phone: "0241234567", region: "Greater Accra", cityTown: "Accra", areaSuburb: null, streetLandmark: null, ghanapostGps: null, deliveryInstructions: null, deliveryArea: "accra", isDefault: false }] }));
vi.mock("@/features/account/organisation", () => ({ getCustomerOrganisation: async () => ({ id: "org", name: "Member School", type: "school", role: "member", email: null, phone: null }) }));
vi.mock("@/features/account/history", () => ({ listCustomerQuotes: async () => [{ id: "quote-123", number: "Q-123", status: "submitted", grandTotal: 100, createdAt: new Date(), accessToken: "quote-token-123" }] }));
vi.mock("@/features/account/actions", () => ({ saveAddressAction: async () => ({}), defaultAddressAction: async () => ({}), removeAddressAction: async () => ({}), saveOrganisationAction: async () => ({}) }));

describe("account surfaces", () => {
  it("offers edit and default for a saved Ghana address", async () => {
    render(await AddressesPage());
    expect(screen.getByText("Edit address")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Make default" })).toBeInTheDocument();
    expect(screen.getAllByLabelText(/Phone Number/)[0]).toHaveAttribute("type", "tel");
    expect(screen.queryByLabelText(/ZIP|Postal code/)).not.toBeInTheDocument();
  });
  it("shows organisation members a read-only view", async () => {
    render(await OrganisationPage());
    expect(screen.getByText("Member School")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Save organisation/ })).not.toBeInTheDocument();
    expect(screen.getByText(/owner can edit/i)).toBeInTheDocument();
  });
  it("opens authenticated quote links without secret tokens", async () => {
    render(await QuotesPage());
    expect(screen.getByRole("link", { name: "Q-123" })).toHaveAttribute("href", "/quote/quote-token-123");
  });
});
