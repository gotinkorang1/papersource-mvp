import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StoreFooter } from "./store-footer";

describe("StoreFooter developer credit", () => {
  it("credits the developer and his firm with external links", async () => {
    render(await StoreFooter());

    const developer = screen.getByRole("link", { name: "Gershon Otinkorang" });
    expect(developer).toHaveAttribute("href", "https://gershon.one");
    expect(developer).toHaveAttribute("target", "_blank");

    const firm = screen.getByRole("link", { name: "Cliq It Firm Ltd" });
    expect(firm).toHaveAttribute("href", "https://cliqitfirm.com");
    expect(firm).toHaveAttribute("rel", expect.stringContaining("noopener"));
  });
});
