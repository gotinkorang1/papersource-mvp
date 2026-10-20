import { describe, expect, it } from "vitest";
import { pickFeaturedIds, type FeaturedCandidate } from "./featured";

const make = (id: string, divisionSlug: string, extra: Partial<FeaturedCandidate> = {}): FeaturedCandidate => ({
  id,
  divisionSlug,
  hasImage: true,
  stock: "in_stock",
  ...extra,
});

describe("pickFeaturedIds", () => {
  it("spreads picks across divisions before repeating one", () => {
    const ids = pickFeaturedIds([
      make("b1", "books-notebooks"),
      make("b2", "books-notebooks"),
      make("b3", "books-notebooks"),
      make("p1", "paper-printing"),
      make("w1", "writing-marking"),
      make("f1", "filing-organisation"),
    ]);
    expect(ids).toEqual(["p1", "w1", "f1", "b1"]);
  });

  it("does not let books crowd out workplace ranges", () => {
    const ids = pickFeaturedIds([
      make("b1", "books-notebooks"),
      make("b2", "books-notebooks"),
      make("p1", "paper-printing"),
    ], 3);
    expect(ids[0]).toBe("p1");
  });

  it("prefers photographed, in-stock products within a division", () => {
    const ids = pickFeaturedIds([
      make("p-out", "paper-printing", { stock: "out" }),
      make("p-noimg", "paper-printing", { hasImage: false }),
      make("p-good", "paper-printing"),
    ], 1);
    expect(ids).toEqual(["p-good"]);
  });

  it("falls back to out-of-stock products only when needed", () => {
    expect(pickFeaturedIds([make("x", "paper-printing", { stock: "out" })], 2)).toEqual(["x"]);
  });

  it("handles empty input", () => {
    expect(pickFeaturedIds([], 4)).toEqual([]);
  });
});
