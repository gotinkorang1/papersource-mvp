import { describe, expect, it } from "vitest";
import { isTransientAuthError } from "./transient-error";

describe("transient Auth error classification", () => {
  it.each([
    [{ status: 402 }, true],
    [{ status: 429 }, true],
    [{ status: 503 }, true],
    [{ code: "database_unavailable" }, true],
    [{ code: "invalid_credentials" }, false],
    [{ status: 400 }, false],
    [new Error("network detail"), false],
    [null, false],
  ])("classifies %j safely", (error, expected) => {
    expect(isTransientAuthError(error)).toBe(expected);
  });
});
