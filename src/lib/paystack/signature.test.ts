import { describe, expect, it } from "vitest";
import {
  PAYSTACK_MOCK_SECRET,
  paystackSignatureValid,
  signPaystackBody,
} from "./signature";

describe("paystackSignatureValid", () => {
  it("accepts an HMAC of the raw body", () => {
    const raw = '{"event":"charge.success"}';
    const signature = signPaystackBody(raw, PAYSTACK_MOCK_SECRET);
    expect(paystackSignatureValid(raw, signature, PAYSTACK_MOCK_SECRET)).toBe(true);
  });

  it("rejects a tampered body", () => {
    const signature = signPaystackBody('{"event":"charge.success"}', PAYSTACK_MOCK_SECRET);
    expect(
      paystackSignatureValid('{"event":"charge.failed"}', signature, PAYSTACK_MOCK_SECRET),
    ).toBe(false);
  });
});
