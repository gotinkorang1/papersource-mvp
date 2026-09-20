import { describe, expect, it } from "vitest";
import { readLocalValue, writeLocalValue } from "./local-storage";

describe("safe local storage", () => {
  it("round-trips a value", () => {
    writeLocalValue("papersource-test-value", "1");
    expect(readLocalValue("papersource-test-value")).toBe("1");
  });
});
