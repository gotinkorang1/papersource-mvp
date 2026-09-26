import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
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
  it("blocks more than five attachments before submission", () => {
    render(<RfqForm />);
    const input = screen.getByLabelText("Attachments (optional)") as HTMLInputElement;
    const files = Array.from({ length: 6 }, (_, index) =>
      new File([`document-${index}`], `document-${index}.pdf`, { type: "application/pdf" }),
    );

    fireEvent.change(input, { target: { files } });

    expect(screen.getByRole("alert")).toHaveTextContent("Choose no more than 5 files.");
    expect(input.validationMessage).toBe("Choose no more than 5 files.");
  });
  it("blocks an attachment larger than fifteen megabytes", () => {
    render(<RfqForm />);
    const input = screen.getByLabelText("Attachments (optional)") as HTMLInputElement;
    const oversized = new File([new Uint8Array(15 * 1024 * 1024 + 1)], "large.pdf", {
      type: "application/pdf",
    });

    fireEvent.change(input, { target: { files: [oversized] } });

    expect(screen.getByRole("alert")).toHaveTextContent("Each attachment must be 15 MB or smaller.");
    expect(input.validationMessage).toBe("Each attachment must be 15 MB or smaller.");
  });
});
