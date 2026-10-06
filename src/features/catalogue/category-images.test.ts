import { describe, expect, it } from "vitest";
import { listDivisionCategoriesFromSeed } from "./seed-queries";
import { categoryImageFor } from "./category-images";

describe("category image mapping", () => {
  it("gives each seeded category its own relevant fallback image", () => {
    const categories = listDivisionCategoriesFromSeed().map((category) => ({ ...category, imagePublicId: null }));
    const images = categories.map((category) => categoryImageFor(category));

    expect(images.every((image) => image.alt.length > 0)).toBe(true);
    expect(new Set(images.map((image) => image.src)).size).toBe(images.length);
  });
});
