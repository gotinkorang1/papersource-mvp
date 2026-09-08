import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, expect, it } from "vitest";
import { PrintReceiptButton } from "./print-receipt-button";

it("opens the browser print dialog for saving an order receipt as PDF", async () => {
  const user = userEvent.setup();
  const print = vi.spyOn(window, "print").mockImplementation(() => undefined);

  render(<PrintReceiptButton />);
  await user.click(screen.getByRole("button", { name: /print receipt/i }));

  expect(print).toHaveBeenCalledOnce();
  print.mockRestore();
});
