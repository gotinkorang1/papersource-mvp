import { describe, expect, it } from "vitest";
import { buildShopMenuColumns } from "./shop-menu-model";

describe("shop menu catalogue model", () => {
  it("adds live root categories without duplicates", () => {
    const columns = buildShopMenuColumns([
      { name: "School Supplies", slug: "school-supplies" },
      { name: "Paper & Printing", slug: "paper-printing" },
      { name: "School Supplies", slug: "school-supplies" },
    ]);

    const links = columns.flatMap((column) => column.links);
    expect(links).toContainEqual({ label: "School Supplies", href: "/shop/school-supplies" });
    expect(links.filter((link) => link.href === "/shop/school-supplies")).toHaveLength(1);
  });

  it("keeps the fallback catalogue when no live categories are available", () => {
    const links = buildShopMenuColumns([]).flatMap((column) => column.links);
    expect(links).toContainEqual({ label: "Workplace", href: "/shop/workplace" });
  });

  it("skips malformed live category links", () => {
    const links = buildShopMenuColumns([
      { name: "", slug: "" },
      { name: "Broken", slug: "not a route" },
      { name: " Paper ", slug: "paper" },
      { name: "Paper duplicate", slug: "PAPER" },
    ]).flatMap((column) => column.links);

    expect(links).toEqual([{ label: "Paper", href: "/shop/paper" }]);
  });

  it("ignores runtime records with missing text fields", () => {
    const links = buildShopMenuColumns([
      { name: null, slug: "paper" },
      { name: "Writing", slug: null },
      { name: "Desk", slug: "desk" },
    ] as unknown as { name: string; slug: string }[]).flatMap((column) => column.links);

    expect(links).toEqual([{ label: "Desk", href: "/shop/desk" }]);
  });
});
