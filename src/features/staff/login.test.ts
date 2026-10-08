import { describe, expect, it } from "vitest";
import { isStaffAuthServiceUnavailable } from "./auth-errors";

describe("staff authentication availability", () => {
  it.each([
    { error: { status: 402 }, label: "quota restriction" },
    { error: { status: 408 }, label: "provider timeout" },
    { error: { status: 425 }, label: "provider temporarily unavailable" },
    { error: { status: 429 }, label: "rate limiting" },
    { error: { status: 503 }, label: "provider outage" },
    { error: { code: "over_request_rate_limit" }, label: "provider rate-limit code" },
    { error: { code: "service_unavailable" }, label: "provider unavailable code" },
  ])("recognises $label as retryable", ({ error }) => {
    expect(isStaffAuthServiceUnavailable(error)).toBe(true);
  });

  it.each([
    { error: { status: 400 }, label: "invalid credentials" },
    { error: { code: "invalid_credentials" }, label: "invalid credential code" },
    { error: null, label: "missing provider error" },
  ])("keeps $label as a credential failure", ({ error }) => {
    expect(isStaffAuthServiceUnavailable(error)).toBe(false);
  });
});
