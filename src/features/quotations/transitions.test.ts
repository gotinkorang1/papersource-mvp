import { describe, expect, it } from "vitest";
import { assertQuoteTransition, canTransitionQuote } from "./transitions";

describe("quote transitions", () => {
  it("allows guest submit from draft", () => {
    expect(canTransitionQuote("draft", "submitted")).toBe(true);
  });

  it("rejects jumping submitted to paid", () => {
    expect(canTransitionQuote("submitted", "paid")).toBe(false);
    expect(() => assertQuoteTransition("submitted", "paid")).toThrow(
      /submitted to paid/,
    );
  });
});
