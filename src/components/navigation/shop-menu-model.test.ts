import { describe, expect, it } from "vitest";
import { buildShopMenuColumns } from "./shop-menu-model";

describe("shop menu catalogue model", () => {
  it("adds live root categories such as Books & Notebooks without duplicates", () => {
    const columns = buildShopMenuColumns([
      { name: "Books & Notebooks", slug: "books-notebooks" },
      { name: "Paper & Printing", slug: "paper-printing" },
      { name: "Books & Notebooks", slug: "books-notebooks" },
    ]);

    const links = columns.flatMap((column) => column.links);
    expect(links).toContainEqual({ label: "Books & Notebooks", href: "/shop/books-notebooks" });
    expect(links.filter((link) => link.href === "/shop/books-notebooks")).toHaveLength(1);
  });

  it("keeps the fallback catalogue when no live categories are available", () => {
    const links = buildShopMenuColumns([]).flatMap((column) => column.links);
    expect(links).toContainEqual({ label: "Books & Notebooks", href: "/shop/books-notebooks" });
  });
});
