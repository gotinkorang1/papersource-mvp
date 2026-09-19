import { describe, expect, it } from "vitest";
import { validateProductViewPayload } from "./view-route";

describe("validateProductViewPayload", () => {
  const productId = "11111111-1111-4111-8111-111111111111";

  it("accepts a bounded anonymous product-view payload", () => {
    expect(validateProductViewPayload({ productId, fingerprint: "browser-token-123456" })).toEqual({ productId, fingerprint: "browser-token-123456" });
  });

  it("rejects malformed IDs, missing fingerprints, and oversized fingerprints", () => {
    expect(validateProductViewPayload({ productId: "not-an-id", fingerprint: "browser-token-123456" })).toBeNull();
    expect(validateProductViewPayload({ productId, fingerprint: "short" })).toBeNull();
    expect(validateProductViewPayload({ productId, fingerprint: "x".repeat(129) })).toBeNull();
  });
});
