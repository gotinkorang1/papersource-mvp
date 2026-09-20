import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SubmitProgressButton } from "./submit-progress-button";

describe("SubmitProgressButton", () => {
  it("requires a selected checkbox when configured for bulk actions", async () => {
    const user = userEvent.setup();
    render(
      <form>
        <input type="checkbox" name="productId" aria-label="Product" />
        <SubmitProgressButton requiresSelection idleLabel="Apply" pendingLabel="Applying" className="button" />
      </form>,
    );

    const button = screen.getByRole("button", { name: "Apply" });
    expect(button).toBeDisabled();
    await user.click(screen.getByRole("checkbox", { name: "Product" }));
    expect(button).toBeEnabled();
  });
});
