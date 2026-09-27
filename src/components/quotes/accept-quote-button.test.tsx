import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { AcceptQuoteButton } from "./accept-quote-button";

describe("AcceptQuoteButton", () => {
  it("requires confirmation before accepting a quotation", () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<AcceptQuoteButton token="quote-token" />);
    const button = screen.getByRole("button", { name: "Accept Quote" }) as HTMLButtonElement;
    const form = button.form;

    fireEvent.submit(form!);

    expect(confirm).toHaveBeenCalledWith("Accept this quotation and continue to the order/payment process?");
    expect(button).toBeEnabled();
    confirm.mockRestore();
  });
});
