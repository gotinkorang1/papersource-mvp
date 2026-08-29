---
name: paystack-payments
description: Server-authoritative Paystack (card + MoMo) init, webhook, verify, and idempotency. Use when touching payments or order paid status.
---

# Paystack payments

Read @docs/ECOMMERCE.md (Paystack) and @docs/SECURITY.md.

## When to Use

- Initialize checkout, webhooks, verify, payment status, MoMo

## Instructions

1. Server creates the order and `payments` row, then Initialize Paystack with server-computed `grand_total` (pesewas → Paystack minor units via one converter).
2. Persist `paystack_reference`. Do not mark the order paid at init or on the return URL.
3. `POST /api/paystack/webhook`: verify signature; insert `payment_events.provider_event_id` uniquely; duplicate event = 200 no-op.
4. Verify with the secret key. Amount and reference must match the payment row.
5. MoMo is asynchronous. Browser “success” is not final.
6. Fulfil and decrement inventory only after `payments.status = success` or audit-logged admin terms (bank / PO / invoice).
7. Never create a second open payment for the same order without abandoning the first.
8. Never use production keys against local/staging databases.
9. Forbidden: `if (url.includes("success")) order.paid = true`.
