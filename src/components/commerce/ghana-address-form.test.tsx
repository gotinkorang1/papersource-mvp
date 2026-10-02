import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GhanaAddressForm } from "@/components/commerce/ghana-address-form";

describe("GhanaAddressForm", () => {
  it("associates server validation with the affected Ghana address field", () => {
    render(<GhanaAddressForm fieldErrors={{ phone: ["Enter a valid phone number"] }} />);
    expect(screen.getByLabelText(/Phone Number/)).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText(/Phone Number/)).toHaveAccessibleDescription("Enter a valid phone number");
  });
  it("requires phone and does not ask for a US ZIP", () => {
    render(<GhanaAddressForm />);

    expect(screen.getByLabelText(/Phone Number/)).toBeRequired();
    expect(screen.queryByLabelText(/zip/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/postal/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/GhanaPost GPS/)).not.toBeRequired();
  });

  it("explains nationwide delivery when Other Region is selected", async () => {
    const user = userEvent.setup();
    render(<GhanaAddressForm />);

    await user.click(screen.getByRole("radio", { name: "Other Region" }));

    expect(
      screen.getByText(/nationwide delivery option and cost/i),
    ).toBeInTheDocument();
  });

  it("offers shop pickup without requiring delivery address fields", async () => {
    const user = userEvent.setup();
    render(<GhanaAddressForm allowPickup />);

    await user.click(screen.getByRole("radio", { name: "Pick up at our shop" }));

    expect(screen.getByText(/prepare your order for collection/i)).toBeInTheDocument();
    expect(screen.queryByLabelText("Region")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("City / Town")).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/)).toBeRequired();
    expect(screen.getByLabelText(/Phone Number/)).toBeRequired();
  });

  it("clears a saved address when starting a new address", async () => {
    const user = userEvent.setup();
    render(
      <GhanaAddressForm
        savedAddresses={[{
          id: "saved-1",
          label: "Office · Accra",
          values: { fullName: "Office Contact", phone: "0555001313" },
        }]}
      />,
    );

    const selector = screen.getByLabelText("Saved address");
    await user.selectOptions(selector, "saved-1");
    expect(screen.getByLabelText(/Full Name/)).toHaveValue("Office Contact");

    await user.selectOptions(selector, "");
    expect(screen.getByLabelText(/Full Name/)).toHaveValue("");
    expect(screen.getByLabelText(/Phone Number/)).toHaveValue("");
  });

  it("shows progress while the address form is submitting", () => {
    render(<GhanaAddressForm submitLabel="Placing order…" busy submitDisabled />);

    const button = screen.getByRole("button", { name: "Placing order…" });
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toBeDisabled();
    expect(button.querySelector("span[aria-hidden='true']")).toBeInTheDocument();
  });

  it("keeps mutation identifiers submitted while the form is busy", () => {
    render(<GhanaAddressForm hiddenInputs={[{ name: "addressId", value: "saved-1" }]} busy />);

    const addressId = document.querySelector<HTMLInputElement>('input[name="addressId"]');
    expect(addressId).toHaveValue("saved-1");
    expect(addressId).not.toBeDisabled();
  });
});
