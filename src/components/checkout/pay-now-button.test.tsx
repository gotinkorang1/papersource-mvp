import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const actions = vi.hoisted(() => ({ start: vi.fn() }));
vi.mock("@/features/payments/actions", () => ({ startPaystackPaymentAction: actions.start }));

import { PayNowButton } from "./pay-now-button";

describe("PayNowButton", () => {
  it("shows progress and prevents a second handoff while starting payment", async () => {
    actions.start.mockImplementationOnce(() => new Promise(() => {}));
    const user = userEvent.setup();
    render(<PayNowButton orderId="order-1" />);

    const button = screen.getByRole("button", { name: "Pay with Paystack" });
    await user.click(button);

    const pendingButton = screen.getByRole("button", { name: "Starting Paystack…" });
    expect(pendingButton).toBeDisabled();
    expect(pendingButton).toHaveAttribute("aria-busy", "true");
    expect(pendingButton.querySelector("span[aria-hidden='true']")).toBeInTheDocument();
  });
});
