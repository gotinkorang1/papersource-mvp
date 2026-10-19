import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { RecentlyViewed, rememberRecentlyViewed } from "./recently-viewed";

describe("RecentlyViewed", () => {
  afterEach(() => window.localStorage.clear());

  it("renders nothing for a first-time visitor", () => {
    const { container } = render(<RecentlyViewed />);
    expect(container).toBeEmptyDOMElement();
  });

  it("remembers the current product without listing it", () => {
    act(() => rememberRecentlyViewed({ slug: "stapler", name: "Desk Stapler" }));
    render(<RecentlyViewed record={{ slug: "a4-paper", name: "A4 Paper" }} />);

    expect(screen.getByRole("link", { name: /Desk Stapler/ })).toHaveAttribute("href", "/product/stapler");
    expect(screen.queryByRole("link", { name: /A4 Paper/ })).not.toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem("ps:recently-viewed") ?? "[]")[0].slug).toBe("a4-paper");
  });

  it("keeps the most recent views first without duplicates", () => {
    act(() => {
      rememberRecentlyViewed({ slug: "one", name: "One" });
      rememberRecentlyViewed({ slug: "two", name: "Two" });
      rememberRecentlyViewed({ slug: "one", name: "One" });
    });
    render(<RecentlyViewed />);
    expect(screen.getAllByRole("link").map((link) => link.textContent)).toEqual(["One", "Two"]);
  });

  it("ignores corrupted storage", () => {
    window.localStorage.setItem("ps:recently-viewed", "{not json");
    const { container } = render(<RecentlyViewed />);
    expect(container).toBeEmptyDOMElement();
  });
});
