import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CopySkuButton } from "./copy-sku-button";

describe("CopySkuButton", () => {
  it("keeps the SKU action easy to tap on mobile", () => {
    render(<CopySkuButton sku="PS-A4-001" />);

    const button = screen.getByRole("button", { name: "Copy SKU PS-A4-001" });
    expect(button).toHaveClass("min-h-11");
    expect(button).toHaveTextContent("SKU PS-A4-001");
  });
});
