import { describe, expect, it } from "vitest";
import { filterAndSortBrands } from "./brand-directory-model";

const brands = [
  { id: "1", name: "DELI", slug: "deli", categories: [{ name: "Writing", slug: "writing" }] },
  { id: "2", name: "Oxford", slug: "oxford", categories: [{ name: "Books", slug: "books" }] },
  { id: "3", name: "DELI", slug: "deli-copy", categories: [{ name: "Writing", slug: "writing" }] },
];

describe("brand directory model", () => {
  it("removes duplicate brand names and filters by name and category", () => {
    const result = filterAndSortBrands(brands, { query: "ox", category: "books", sort: "name" });
    expect(result.map((brand) => brand.name)).toEqual(["Oxford"]);
  });

  it("sorts the directory alphabetically when no filter is selected", () => {
    const result = filterAndSortBrands(brands, { query: "", category: "", sort: "name" });
    expect(result.map((brand) => brand.name)).toEqual(["DELI", "Oxford"]);
  });

  it("merges categories from duplicate brand records", () => {
    const result = filterAndSortBrands(
      [
        { id: "1", name: "Scholastic", slug: "scholastic", categories: [{ name: "Books", slug: "books" }] },
        { id: "2", name: " scholastic ", slug: "scholastic-press", categories: [{ name: "Education", slug: "education" }] },
      ],
      { query: "", category: "education", sort: "name" },
    );

    expect(result).toHaveLength(1);
    expect(result[0]?.slug).toBe("scholastic");
    expect(result[0]?.categories.map((category) => category.slug)).toEqual(["books", "education"]);
  });
});
