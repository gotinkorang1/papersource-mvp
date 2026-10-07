import { describe, expect, it } from "vitest";
import { listDivisionCategoriesFromSeed } from "./seed-queries";
import { categoryImageFor, categoryImagesFor } from "./category-images";

describe("category image mapping", () => {
  it("gives each seeded category its own relevant fallback image", () => {
    const categories = listDivisionCategoriesFromSeed().map((category) => ({ ...category, imagePublicId: null }));
    const images = categories.map((category) => categoryImageFor(category));

    expect(images.every((image) => image.alt.length > 0)).toBe(true);
    expect(new Set(images.map((image) => image.src)).size).toBe(images.length);
  });

  it("keeps the live storefront division categories visually distinct", () => {
    const liveSlugs = ["paper-printing", "writing-marking", "filing-organisation", "office-equipment", "school-supplies", "arts-crafts", "desk-accessories", "general-supplies", "books-notebooks", "workplace"];
    const images = liveSlugs.map((slug) => categoryImageFor({ slug, name: slug, imagePublicId: null }));

    expect(new Set(images.map((image) => image.src)).size).toBe(liveSlugs.length);
  });

  it("keeps curated category artwork when uploaded assets are duplicated", () => {
    const categories = [
      { slug: "arts-crafts", name: "Arts & Crafts", imagePublicId: "shared" },
      { slug: "desk-accessories", name: "Desk Accessories", imagePublicId: "shared" },
      { slug: "general-supplies", name: "General Supplies", imagePublicId: "shared" },
    ];

    const images = categoryImagesFor(categories);

    expect(new Set(images.map((image) => image.src)).size).toBe(categories.length);
    expect(images.map((image) => image.alt)).toEqual([
      "Arts, crafts and creative project materials",
      "Desk organisers and everyday office accessories",
      "General workplace and school supplies",
    ]);
  });
});
