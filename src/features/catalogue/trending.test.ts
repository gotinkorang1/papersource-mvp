import { describe, expect, it } from "vitest";
import { aggregateTrending, isViewEventEligible, viewEventDay } from "./trending";

describe("product view analytics", () => {
  const now = new Date("2026-09-19T12:00:00.000Z");

  it("uses a UTC calendar day for event deduplication", () => {
    expect(viewEventDay(new Date("2026-09-19T23:59:59.000Z"))).toBe("2026-09-19");
    expect(viewEventDay(new Date("2026-09-20T00:00:00.000Z"))).toBe("2026-09-20");
  });

  it("accepts only recent, bounded product opens", () => {
    expect(isViewEventEligible({ productId: "product-1", fingerprint: "session-1", occurredAt: now }, now)).toBe(true);
    expect(isViewEventEligible({ productId: "", fingerprint: "session-1", occurredAt: now }, now)).toBe(false);
    expect(isViewEventEligible({ productId: "product-1", fingerprint: "x".repeat(129), occurredAt: now }, now)).toBe(false);
    expect(isViewEventEligible({ productId: "product-1", fingerprint: "session-1", occurredAt: new Date("2026-08-19T11:59:59.000Z") }, now)).toBe(false);
    expect(isViewEventEligible({ productId: "product-1", fingerprint: "session-1", occurredAt: new Date("2026-09-20T00:00:00.000Z") }, now)).toBe(false);
  });

  it("aggregates only unique daily opens in the rolling window", () => {
    const counts = aggregateTrending([
      { productId: "product-1", fingerprint: "session-a", occurredAt: new Date("2026-09-19T08:00:00.000Z") },
      { productId: "product-1", fingerprint: "session-a", occurredAt: new Date("2026-09-19T10:00:00.000Z") },
      { productId: "product-1", fingerprint: "session-b", occurredAt: new Date("2026-09-18T10:00:00.000Z") },
      { productId: "product-1", fingerprint: "session-c", occurredAt: new Date("2026-08-19T11:59:59.000Z") },
      { productId: "product-2", fingerprint: "session-d", occurredAt: new Date("2026-09-19T10:00:00.000Z") },
    ], now);

    expect(counts).toEqual(new Map([["product-1", 2], ["product-2", 1]]));
  });
});
