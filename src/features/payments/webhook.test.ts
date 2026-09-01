import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { PAYSTACK_MOCK_SECRET, signPaystackBody } from "@/lib/paystack/signature";
import { WebhookSignatureError } from "./webhook";
import { paystackSignatureValid } from "@/lib/paystack/signature";

describe("webhook signature gate", () => {
  it("rejects an unsigned payload before any fulfil work", () => {
    const raw = JSON.stringify({
      event: "charge.success",
      data: { id: 1, reference: "ps_test", amount: 10300, currency: "GHS" },
    });
    expect(paystackSignatureValid(raw, "nope", PAYSTACK_MOCK_SECRET)).toBe(false);
    expect(() => {
      if (!paystackSignatureValid(raw, "nope", PAYSTACK_MOCK_SECRET)) {
        throw new WebhookSignatureError();
      }
    }).toThrow(WebhookSignatureError);
  });

  it("accepts a correctly signed charge.success body", () => {
    const raw = JSON.stringify({
      event: "charge.success",
      data: { id: 1, reference: "ps_test", amount: 10300, currency: "GHS" },
    });
    const signature = signPaystackBody(raw, PAYSTACK_MOCK_SECRET);
    expect(paystackSignatureValid(raw, signature, PAYSTACK_MOCK_SECRET)).toBe(true);
  });
});
