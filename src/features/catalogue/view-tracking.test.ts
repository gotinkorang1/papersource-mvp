import { describe, expect, it } from "vitest";
import { ensureViewFingerprint } from "./view-tracking";

describe("ensureViewFingerprint", () => {
  it("persists a stable anonymous browser fingerprint", () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    };

    const first = ensureViewFingerprint(storage);
    const second = ensureViewFingerprint(storage);

    expect(first).toBe(second);
    expect(first.length).toBeGreaterThanOrEqual(16);
  });
});
