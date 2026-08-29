import { describe, expect, it } from "vitest";
import { assertQuoteTransition, canTransitionQuote } from "./transitions";

describe("quote transitions", () => {
  it("allows guest submit from draft", () => {
    expect(canTransitionQuote("draft", "submitted")).toBe(true);
  });

  it("allows sales to send a priced quote and the guest to accept it", () => {
    expect(canTransitionQuote("submitted", "under_review")).toBe(true);
    expect(canTransitionQuote("under_review", "priced")).toBe(true);
    expect(canTransitionQuote("priced", "sent")).toBe(true);
    expect(canTransitionQuote("sent", "accepted")).toBe(true);
    expect(canTransitionQuote("accepted", "payment_pending")).toBe(true);
  });

  it("rejects jumping submitted to paid", () => {
    expect(canTransitionQuote("submitted", "paid")).toBe(false);
    expect(() => assertQuoteTransition("submitted", "paid")).toThrow(
      /submitted to paid/,
    );
  });
});
