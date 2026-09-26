import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PriceDisplay } from "./price-display";

describe("PriceDisplay", () => {
  it("renders a unit suffix only once when the data already includes a slash", () => {
    render(<PriceDisplay pesewas={15000} unitLabel="/ each" />);

    const price = screen.getByText("GHS 150.00").closest("p");
    expect(price).toHaveTextContent("GHS 150.00 / each");
    expect(price).not.toHaveTextContent("GHS 150.00 / / each");
    expect(price).toHaveClass("whitespace-nowrap");
  });
});
