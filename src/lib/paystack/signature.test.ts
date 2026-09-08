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

  it("fails closed when production has no configured secret", () => {
    const previousNodeEnv = process.env.NODE_ENV;
    const previousSecret = process.env.PAYSTACK_SECRET_KEY;
    (process.env as Record<string, string | undefined>).NODE_ENV = "production";
    delete process.env.PAYSTACK_SECRET_KEY;

    try {
      expect(paystackSignatureValid('{"event":"charge.success"}', "deadbeef")).toBe(false);
    } finally {
      (process.env as Record<string, string | undefined>).NODE_ENV = previousNodeEnv;
      if (previousSecret === undefined) delete process.env.PAYSTACK_SECRET_KEY;
      else process.env.PAYSTACK_SECRET_KEY = previousSecret;
    }
  });
});
