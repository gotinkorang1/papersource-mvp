---
name: b2b-quotations
description: Quote basket, guest RFQ, document upload, quote state machine, and quote-to-order. Use when building quotes, RFQ, or sales quote admin.
---

# B2B quotations

Read @docs/RFQ.md.

## When to Use

- Quote basket, RFQ submit, quote admin, accept, revisions, quote→order

## Instructions

1. Quote basket ≠ cart. Draft quotes (`status = draft`) are the basket.
2. Guests may submit. Collect organisation, contact, phone, email, Ghana delivery, notes.
3. Optional private uploads (PDF, Excel, Word, image) via Supabase Storage + signed URLs.
4. Happy path: draft → submitted → under_review → priced → sent → accepted → payment_pending → paid → order_created.
5. Other statuses: declined, expired, cancelled, revised. Write `quote_events` on every transition.
6. Snapshot lines on submit and again when priced. Client cannot set `paid`.
7. Revisions clone; mark the old quote `revised`. Do not overwrite a sent quote in place.
8. Accept → Pay Now (Paystack) or admin Bank Transfer / PO / Invoice Terms.
9. Orders from quotes use `source = quote` and **quoted** totals, not live catalogue tiers.
10. WhatsApp may discuss a quote; it must not replace Submit or Accept.
