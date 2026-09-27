import { describe, expect, it } from "vitest";
import { categorySeoDescription } from "./seo-copy";

describe("category SEO copy", () => {
  it("keeps every live catalogue category specific", () => {
    const liveCategories = [
      ["paper-printing", /A4|toner|printer/i],
      ["writing-marking", /pens|pencils|markers/i],
      ["filing-organisation", /files|folders|binders/i],
      ["office-equipment", /office equipment|technology/i],
      ["school-supplies", /Ghanaian learners|classrooms/i],
      ["arts-crafts", /art|craft|creative/i],
      ["books-notebooks", /books|notebooks|journals/i],
      ["general-supplies", /office|school|home essentials/i],
    ] as const;

    for (const [slug, expected] of liveCategories) {
      expect(categorySeoDescription({ slug, name: slug })).toMatch(expected);
    }
  });
});
