import { describe, expect, it } from "vitest";
import {
  assertPaystackAmountMatches,
  pesewasToPaystackAmount,
} from "./amount";

describe("pesewasToPaystackAmount", () => {
  it("maps GHS subunits 1:1", () => {
    expect(pesewasToPaystackAmount(10300)).toBe(10300);
  });

  it("rejects floats and zero", () => {
    expect(() => pesewasToPaystackAmount(78.99)).toThrow(/integer/);
    expect(() => pesewasToPaystackAmount(0)).toThrow(/positive/);
  });
});

describe("assertPaystackAmountMatches", () => {
  it("rejects a mismatched verify amount", () => {
    expect(() => assertPaystackAmountMatches(9900, 10300)).toThrow(
      /does not match/,
    );
  });
});
