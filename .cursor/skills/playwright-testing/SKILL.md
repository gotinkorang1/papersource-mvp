---
name: playwright-testing
description: PaperSource test layers and critical E2E. Use when adding features, writing tests, or verifying UI.
---

# Playwright testing

Read @docs/TESTING.md.

## When to Use

- After implementing a user-facing or payment/quote feature
- Adding Vitest, RTL, or Playwright coverage

## Instructions

1. Done means: implement → unit/component/E2E as appropriate → browser verify (mobile + desktop) → check console.
2. Vitest for pricing, VAT split, zones, quote transitions, pesewas, Paystack amounts, webhook idempotency.
3. RTL for ProductCard dual CTAs, Ghana address, independent cart/quote counts.
4. Playwright critical flows: search→cart; product→RFQ; guest checkout; Paystack init; webhook replay; admin product; admin quote response; accept quote; quote→order; delivery calculation.
5. Assert cart and quote counts stay independent on dual-path flows.
6. Mock or use Paystack test keys. Never production secrets. Never assert paid from a redirect URL.
7. axe on home, shop, PDP, checkout, quote submit when those pages exist.
