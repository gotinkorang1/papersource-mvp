import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AnnouncementTicker } from "./announcement-ticker";

describe("AnnouncementTicker", () => {
  it("exposes a concise accessible service summary", () => {
    render(<AnnouncementTicker />);

    expect(screen.getByRole("region", { name: "PaperSource service highlights" })).toBeInTheDocument();
    expect(screen.getByText("Free shop pickup, Accra and Tema delivery, and VAT-inclusive prices.")).toBeInTheDocument();
    expect(screen.getAllByText("Shop pickup").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Accra & Tema").length).toBeGreaterThan(0);
    expect(screen.getAllByText("VAT included").length).toBeGreaterThan(0);
  });
});
