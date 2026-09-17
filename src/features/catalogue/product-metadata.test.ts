import { describe, expect, it } from "vitest";
import { bookMetadata, productSeoDescription } from "@/features/catalogue/product-metadata";

describe("bookMetadata", () => {
  it("returns author and format only for products with an author attribute", () => {
    expect(
      bookMetadata({
        name: "Stranded",
        specLine: "",
        attributes: [
          { namespace: "book", key: "author", valueText: "Jeff Probst" },
          { namespace: "book", key: "format", valueText: "Paperback" },
        ],
      }),
    ).toEqual(["By Jeff Probst", "Paperback"]);
  });

  it("does not treat format alone as book metadata", () => {
    expect(
      bookMetadata({
        name: "A4 Paper",
        specLine: "A4 • 80gsm • 500 sheets",
        attributes: [
          { namespace: "product", key: "format", valueText: "Ream" },
        ],
      }),
    ).toEqual([]);
  });

  it("ignores author metadata outside the book namespace", () => {
    expect(
      bookMetadata({
        name: "Office Guide",
        specLine: "A workplace handbook",
        attributes: [
          { namespace: "product", key: "author", valueText: "PaperSource" },
          { namespace: "product", key: "format", valueText: "Digital" },
        ],
      }),
    ).toEqual([]);
  });

  it("omits metadata already rendered as the title or specification", () => {
    expect(
      bookMetadata({
        name: "Jeff Probst",
        specLine: "Paperback",
        attributes: [
          { namespace: "book", key: "author", valueText: "Jeff Probst" },
          { namespace: "book", key: "format", valueText: "Paperback" },
        ],
      }),
    ).toEqual([]);
  });

  it("omits author and format segments already represented in the specification line", () => {
    expect(
      bookMetadata({
        name: "Stranded",
        specLine: "By Jeff Probst • Paperback",
        attributes: [
          { namespace: "book", key: "author", valueText: "Jeff Probst" },
          { namespace: "book", key: "format", valueText: "Paperback" },
        ],
      }),
    ).toEqual([]);
  });
});

describe("productSeoDescription", () => {
  it("keeps curated copy and trims it", () => {
    expect(productSeoDescription({ name: "Notebook", brandName: "BIC", categoryName: "Writing", description: "  Durable ruled notebook.  " })).toBe("Durable ruled notebook.");
  });

  it("creates useful fallback copy for incomplete products", () => {
    expect(productSeoDescription({ name: "Notebook", brandName: "BIC", categoryName: "Writing", description: "  " })).toBe("Notebook by BIC. Shop Writing from PaperSource Ghana.");
  });
});
