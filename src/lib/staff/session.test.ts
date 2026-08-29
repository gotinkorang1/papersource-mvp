import { describe, expect, it } from "vitest";
import { readStaffCookie, signStaffCookie } from "./session";

describe("staff session cookie", () => {
  it("round-trips a signed profile id", () => {
    const profileId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
    const value = signStaffCookie(profileId);
    const parsed = readStaffCookie(value);
    expect(parsed?.profileId).toBe(profileId);
  });

  it("rejects a tampered cookie", () => {
    const value = signStaffCookie("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11");
    expect(readStaffCookie(`${value}a`)).toBeNull();
  });
});
