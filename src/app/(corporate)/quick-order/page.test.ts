import { describe, expect, it } from "vitest";
import { metadata } from "./page";

describe("quick order metadata", () => {
  it("keeps the transactional SKU helper out of search results", () => {
    expect(metadata.robots).toMatchObject({ index: false, follow: true });
  });
});
