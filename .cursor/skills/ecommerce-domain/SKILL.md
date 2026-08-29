---
name: ecommerce-domain
description: Retail cart, checkout, server pricing, VAT-inclusive money, delivery zones, and inventory. Use when implementing shop, cart, checkout, or promotions.
---

# Ecommerce domain

Read @docs/ECOMMERCE.md and @docs/DATABASE.md.

## When to Use

- Cart, checkout, orders, delivery fees, promotions
- Price display or inventory decrement

## Instructions

1. Cart (`features/cart`) is retail only. Never store quote lines on the cart.
2. Resolve prices on the server from `price_tiers` + promotions. Client previews only.
3. Money is integer pesewas. VAT-inclusive display; persist `tax_total` + `tax_json`.
4. If a line is `request_quote`, reject retail checkout.
5. Checkout collects Ghana address (phone required) and a `delivery_zones` row.
6. `fee_mode = on_request` (Nationwide): do not invent a fee; change the flow.
7. Create order snapshots, then Initialize Paystack. Mark paid only after webhook + verify.
8. Inventory movements after paid or admin-confirmed terms — not on add-to-cart.
9. Guest cart: httpOnly session cookie + Server Actions.
