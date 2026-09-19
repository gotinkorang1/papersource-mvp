import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("@/features/preview/dual-path-preview", () => ({
  useDualPathPreview: () => ({ addToCart: vi.fn(), addToQuote: vi.fn() }),
  useOptionalDualPathPreview: () => ({ addToCart: vi.fn(), addToQuote: vi.fn() }),
}));
import { CatalogueViewModeControl } from "./catalogue-view-mode";
import { ProductGridList } from "./product-grid-list";
import { sampleProducts } from "@/lib/design-system/fixtures";

describe("CatalogueViewModeControl", () => {
  afterEach(() => {
    window.localStorage.clear();
    vi.unstubAllGlobals();
  });

  it("exposes four labeled modes and marks the active mode", () => {
    render(<CatalogueViewModeControl value="list" onChange={() => undefined} />);

    expect(screen.getByRole("group", { name: "Catalogue display" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Grid" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "List" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Content" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "Default" })).toHaveAttribute("aria-pressed", "false");
  });

  it("reports a mode change through a keyboard-usable button", () => {
    let next = "default";
    render(<CatalogueViewModeControl value="default" onChange={(value) => { next = value; }} />);

    fireEvent.click(screen.getByRole("button", { name: "Content" }));
    expect(next).toBe("content");
  });

  it("renders the selected catalogue mode without losing product actions", () => {
    const { container, rerender } = render(
      <ProductGridList products={[sampleProducts[0]]} viewMode="list" />,
    );

    expect(container.querySelector('[data-catalogue-view="list"]')).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add to Cart" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add to Quote" })).toBeInTheDocument();

    rerender(<ProductGridList products={[sampleProducts[0]]} viewMode="content" />);
    expect(container.querySelector('[data-catalogue-view="content"]')).toBeInTheDocument();
  });

  it("lets a URL-provided mode be changed without a full page reload", async () => {
    const { container } = render(<ProductGridList products={[sampleProducts[0]]} viewMode="list" />);
    fireEvent.click(screen.getByRole("button", { name: "Grid" }));

    await waitFor(() => expect(container.querySelector('[data-catalogue-view="grid"]')).toBeInTheDocument());
  });

  it("restores the device preference when no URL mode is supplied", async () => {
    window.localStorage.setItem("papersource.catalogue.view-mode", "content");
    const { container } = render(<ProductGridList products={[sampleProducts[0]]} />);

    await waitFor(() => expect(container.querySelector('[data-catalogue-view="content"]')).toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Content" })).toHaveAttribute("aria-pressed", "true");
  });

  it("defaults to list mode on mobile when no preference is saved", async () => {
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true }) as MediaQueryList));
    const { container } = render(<ProductGridList products={[sampleProducts[0]]} />);

    await waitFor(() => expect(container.querySelector('[data-catalogue-view="list"]')).toBeInTheDocument());
    expect(screen.getByRole("button", { name: "List" })).toHaveAttribute("aria-pressed", "true");
  });
});
