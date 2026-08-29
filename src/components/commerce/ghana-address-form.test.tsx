import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GhanaAddressForm } from "@/components/commerce/ghana-address-form";

describe("GhanaAddressForm", () => {
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
});
