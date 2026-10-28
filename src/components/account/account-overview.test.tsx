import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AccountPage from "@/app/(account)/account/page";

const customer = vi.hoisted(() => ({ fullName: "Ama Mensah" }));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/customer/require", () => ({ requireCustomer: async () => ({ profileId: "owner", fullName: customer.fullName, email: "ama@example.test", phone: "0241234567" }) }));
vi.mock("@/features/account/addresses", () => ({ listCustomerAddresses: async () => [] }));
vi.mock("@/features/account/organisation", () => ({ getCustomerOrganisation: async () => null }));
vi.mock("@/features/account/history", () => ({
  listCustomerOrders: async () => [
    { id: "order-1", number: "PS-1001", status: "pending_payment", grandTotal: 12_500, createdAt: new Date("2026-10-01") },
    { id: "order-2", number: "PS-1000", status: "delivered", grandTotal: 5_000, createdAt: new Date("2026-09-01") },
  ],
  listCustomerQuotes: async () => [
    { id: "quote-1", number: "Q-200", status: "sent", grandTotal: 90_000, createdAt: new Date("2026-10-02"), accessToken: "token-200" },
    { id: "quote-2", number: "Q-199", status: "declined", grandTotal: 0, createdAt: new Date("2026-09-02"), accessToken: null },
  ],
}));
vi.mock("@/components/account/sign-out-button", () => ({ SignOutButton: () => null }));

describe("account overview", () => {
  it("surfaces quotes to accept and orders to pay", async () => {
    render(await AccountPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByRole("heading", { name: "Needs your attention" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Review quote" })).toHaveAttribute("href", "/quote/token-200");
    expect(screen.getByRole("link", { name: "Complete payment" })).toHaveAttribute("href", "/order/PS-1001");
    expect(screen.getByText("Open quotations").closest("div")).toHaveTextContent("1");
  });

  it("greets customers without a saved name", async () => {
    customer.fullName = "  ";
    render(await AccountPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Welcome back.");
  });
});
