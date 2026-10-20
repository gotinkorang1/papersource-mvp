import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ConfidenceRail } from "./confidence-rail";

describe("ConfidenceRail", () => {
  it("exposes the four shopping benefits as navigable links", () => {
    render(<ConfidenceRail />);

    const rail = screen.getByRole("navigation", { name: "PaperSource shopping benefits" });
    expect(rail).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Shop pickup.*Free collection/ })).toHaveAttribute("href", "/delivery");
    expect(screen.getByRole("link", { name: /Accra & Tema.*Reliable delivery/ })).toHaveAttribute("href", "/delivery");
    expect(screen.getByRole("link", { name: /VAT included.*Clear prices/ })).toHaveAttribute("href", "/shop");
    expect(screen.getByRole("link", { name: /Bulk support.*Quotes for teams/ })).toHaveAttribute("href", "/request-quote");
  });
});
