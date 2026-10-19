import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { parseAdminQuoteStatus } = await import("./admin");

describe("parseAdminQuoteStatus", () => {
  it("accepts known non-draft statuses", () => {
    expect(parseAdminQuoteStatus("sent")).toBe("sent");
    expect(parseAdminQuoteStatus("under_review")).toBe("under_review");
  });

  it("ignores drafts, unknown values and empty input", () => {
    expect(parseAdminQuoteStatus("draft")).toBeUndefined();
    expect(parseAdminQuoteStatus("'; drop table quotes")).toBeUndefined();
    expect(parseAdminQuoteStatus(undefined)).toBeUndefined();
  });
});
