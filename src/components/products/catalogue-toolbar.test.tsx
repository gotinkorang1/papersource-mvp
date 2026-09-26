import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({ children, ...props }: { children: React.ReactNode; href: string }) => <a {...props}>{children}</a>,
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

import { CatalogueToolbar } from "./catalogue-toolbar";

const categories = [{ id: "paper-id", parentId: null, slug: "paper", name: "Paper", caption: "Paper", position: 0 }];
const brands = [{ id: "acme-id", slug: "acme", name: "Acme" }];

describe("CatalogueToolbar", () => {
  it("keeps search and filter controls compact, then opens a full-screen filter sheet", () => {
    render(<CatalogueToolbar count={12} query="paper" categories={categories} brands={brands} />);

    expect(screen.getByRole("searchbox", { name: "Search catalogue" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Search" })).toHaveAttribute("aria-busy", "false");
    expect(screen.getByRole("search").querySelector('input[name="category"]')).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /filters and sort/i })).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /filters and sort/i }));

    expect(screen.getByRole("dialog", { name: "Filters and sorting" })).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Filters and sorting" })).toHaveTextContent("12 products currently match these settings.");
    expect(screen.getByRole("combobox", { name: "Filter by category" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Sort catalogue" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Apply filters" })).toHaveAttribute("aria-busy", "false");
  });

  it("closes the full-screen filter sheet with Escape", () => {
    render(<CatalogueToolbar count={12} categories={categories} brands={brands} />);
    fireEvent.click(screen.getByRole("button", { name: /filters and sort/i }));
    fireEvent.keyDown(screen.getByRole("dialog", { name: "Filters and sorting" }), { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("preserves the current view and delivery context when searching", () => {
    render(<CatalogueToolbar count={12} categories={categories} brands={brands} view="list" zone="accra" />);
    const searchForm = screen.getByRole("search");
    expect(searchForm.querySelector('input[name="view"]')).toHaveValue("list");
    expect(searchForm.querySelector('input[name="zone"]')).toHaveValue("accra");
  });

  it("shows the active search in the filter count", () => {
    render(<CatalogueToolbar count={2} query="paper" categories={categories} brands={brands} />);
    const trigger = screen.getByRole("button", { name: "Filters and sort, 1 active" });
    expect(trigger).toHaveTextContent("1");
  });

  it("makes active filters individually removable", () => {
    render(<CatalogueToolbar count={2} query="paper" category="paper" categories={categories} brands={brands} />);
    const removeSearch = screen.getByRole("link", { name: "Remove search filter" });
    expect(removeSearch).toHaveAttribute("href", "/shop?category=paper");
    expect(removeSearch).toHaveClass("min-h-11");
    expect(screen.getByRole("link", { name: "Remove category filter" })).toHaveAttribute("href", "/shop?q=paper");
  });

  it("clears filters without resetting the selected presentation mode", () => {
    render(<CatalogueToolbar count={2} query="paper" category="paper" view="content" categories={categories} brands={brands} />);
    const clearFilters = screen.getByRole("link", { name: "Clear filters" });
    expect(clearFilters).toHaveAttribute("href", "/shop?view=content");
    expect(clearFilters).toHaveClass("min-h-11");
  });
});
