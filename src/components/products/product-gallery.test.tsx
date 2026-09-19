import { describe, expect, it } from "vitest";
import { dedupeProductImages } from "./product-gallery";

describe("dedupeProductImages", () => {
  it("keeps the first alt text for each unique image", () => {
    expect(dedupeProductImages([
      { src: "https://cdn.example/a.jpg", alt: "Front" },
      { src: "https://cdn.example/a.jpg", alt: "Duplicate" },
      { src: "https://cdn.example/b.jpg", alt: "Back" },
      { src: "", alt: "Missing" },
    ])).toEqual([
      { src: "https://cdn.example/a.jpg", alt: "Front" },
      { src: "https://cdn.example/b.jpg", alt: "Back" },
    ]);
  });
});
