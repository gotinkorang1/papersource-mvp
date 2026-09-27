import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ConfirmQuoteActionForm } from "./confirm-quote-action-form";

describe("ConfirmQuoteActionForm", () => {
  it("does not submit when the customer dismisses confirmation", () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    render(
      <ConfirmQuoteActionForm
        action="/quote/cancel"
        token="quote-token"
        idleLabel="Cancel this request"
        pendingLabel="Cancelling…"
        confirmation="Cancel this quotation request?"
      />,
    );
    const button = screen.getByRole("button", { name: "Cancel this request" }) as HTMLButtonElement;
    const form = button.form;
    expect(form).not.toBeNull();

    fireEvent.submit(form!);

    expect(confirm).toHaveBeenCalledWith("Cancel this quotation request?");
    expect(button).toBeEnabled();
    confirm.mockRestore();
  });
});
