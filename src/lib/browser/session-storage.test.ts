import { describe, expect, it } from "vitest";
import { readSessionFlag, writeSessionFlag } from "./session-storage";

describe("safe session storage", () => {
  it("round-trips a session flag", () => {
    writeSessionFlag("papersource-test-flag");
    expect(readSessionFlag("papersource-test-flag")).toBe(true);
  });
});
