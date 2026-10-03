import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { QuickOrderForm } from "./quick-order-form";

describe("QuickOrderForm", () => {
  it("locks rows while the selected destination is submitting", () => {
    render(<QuickOrderForm />);

    const form = screen.getByRole("button", { name: "Add all to Cart" }).closest("form");
    expect(form).not.toBeNull();
    fireEvent.submit(form!);

    expect(form!.querySelector<HTMLButtonElement>('button[type="submit"]')).toBeDisabled();
    expect(form!.querySelector<HTMLButtonElement>('button[type="button"]')).toBeDisabled();
    expect(screen.getByLabelText("SKU 1")).toBeDisabled();
  });
});
