import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
vi.mock("@/features/quotations/actions", () => ({ submitRfqAction: vi.fn() }));
import { RfqForm } from "./rfq-form";

describe("account RFQ prefill", () => {
  it("prefills customer details but requires an explicit saved-organisation choice", () => {
    render(<RfqForm customer={{ fullName: "Ama", email: "ama@example.test", phone: "0241234567" }}
      organization={{ name: "Paper School", type: "school" }} />);
    expect(screen.getByLabelText(/Contact person/)).toHaveValue("Ama");
    expect(screen.getByLabelText(/^Email/)).toHaveValue("ama@example.test");
    expect(screen.getByRole("checkbox", { name: /Use my saved organisation/ })).not.toBeChecked();
    expect(screen.getByLabelText(/Organisation name/)).toHaveValue("Paper School");
  });
  it("keeps the guest form available without a saved-organisation choice", () => {
    render(<RfqForm />);
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit RFQ" })).toBeEnabled();
  });
});
