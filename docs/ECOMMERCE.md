# PaperSource — Ecommerce (Retail)

**Status:** Phase 0. Must not contradict [PRODUCT.md](PRODUCT.md).  
**Purpose:** Cart, server pricing, VAT-inclusive money, Ghana checkout, delivery zones, Paystack, inventory.  
Quotations: [RFQ.md](RFQ.md). Schema: [DATABASE.md](DATABASE.md).

---

## 1. Dual-path isolation

| Object | Path | Persistence |
| --- | --- | --- |
| Cart | Retail | `carts` / `cart_items` |
| Quote basket | Procurement | `quotes` (status `draft`) / `quote_items` |

Hard rules:

- Retail cart and quote basket are separate persisted objects.
- A user may have both. Twenty quote lines must not alter the cart.
- Do not implement “cart with a quote flag.”
- Header counts are independent.
- Checkout (`/checkout`) reads **cart only**.
- `/request-quote` reads **quote basket only**.

---

## 2. Price resolution (server only)

There is **one** module (e.g. `features/catalogue/pricing.ts`) that, given `variant_id` + `quantity`, returns:

```text
unit_price_pesewas
request_quote: boolean
tier_applied: { min, max } | null
currency: GHS
```

Algorithm:

1. Load active `price_tiers` for the variant, ordered by `minimum_quantity` desc.
2. Find the matching tier: `qty >= minimum` and (`maximum` is null or `qty <= maximum`).
3. If tier `request_quote` is true → retail checkout **cannot** complete that line. UI should have pushed the customer to quote. Server rejects checkout if any line is request-quote-only.
4. If a tier has `unit_price`, use it.
5. Else fall back to `product_variants.base_unit_price`.
6. Apply promotions **on the server** (same module or a single promotions collaborator).
7. Multiply `unit_price * quantity` in integer pesewas.

The client may preview the same numbers for UX. **Legal totals are recomputed at checkout and at quote pricing.** Never calculate the final charge exclusively in the client.

Do not duplicate this logic in ProductCard, CartDrawer, and checkout.

---

## 3. Money and VAT

- Store integer pesewas. `7899` → display `GHS 78.99`.
- Catalogue and tier prices are **VAT-inclusive**. Customers see one GHS figure.
- Persist on orders (and priced quotes):

| Field | Meaning |
| --- | --- |
| goods_total | Inclusive goods |
| tax_total | VAT (and configured levies) **portion** of inclusive amounts |
| tax_json | `{ name, rate_bps, amount }[]` for invoices |
| delivery_fee | Inclusive if calculated; `0` + `pending_nationwide` if on request |
| grand_total | Amount to collect |

Tax rates live in admin settings, not in React. Inclusive split: `tax_portion = round(inclusive - inclusive / (1 + rate))` using an agreed integer rounding rule documented in code (one function, used everywhere).

Never store `78.99` as a float.

---

## 4. Cart behaviour

- Guest cart: httpOnly `session_id` cookie + server actions ([SECURITY.md](SECURITY.md)).
- Login: merge guest lines into the profile cart (sum quantities per variant).
- Quantity changes re-preview tiers (5 units may drop unit price).
- Out-of-stock: allow browse; block checkout of zero-sellable lines or show “request quote / notify” — do not create a paid order for unfulfillable stock without admin override.
- Cart is not a reservation. Stock can change between add and pay.

---

## 5. Ghana checkout

Route: `/checkout`.

Fields:

```text
Full Name
Phone Number          required, tel
Region
City / Town
Area / Suburb
Street / Landmark
GhanaPost GPS         optional, e.g. GA-123-4567
Delivery Instructions
```

Phone is the most important field. Do not require US/CA ZIP.

Delivery area (labels can group zones):

```text
○ Accra
○ Tema
○ Other Region
```

Selecting Accra or Tema maps to an active `delivery_zones` row (or a chooser of Accra Central / East / …). Selecting **Other Region** maps to `Nationwide Request` (`fee_mode = on_request`).

Copy when Other Region:

> We'll contact you to confirm the best nationwide delivery option and cost.

Nationwide checkout:

- May still collect the order as `awaiting_terms` / `pending_payment` with `delivery_fee_status = pending_nationwide`.
- Do not invent a shipping fee in the UI.
- Prefer: create the order, notify admin, email the customer, **do not** take Paystack for a fake delivery total unless goods-only payment is an explicit later decision. **MVP lock:** nationwide retail orders are placed as **enquiry-fulfilment** — customer can pay **goods** only if admin has set a delivery fee, or the flow is “we will contact you” without charging until fee is confirmed.

Recommended MVP behaviour:

1. Accra/Tema: `base_price` from zone; free shipping if goods ≥ `free_shipping_threshold`.
2. Nationwide: no Paystack until sales enters a delivery fee (customer gets email + pay link) **or** customer submits and waits. Admin dashboard lists these as arranging.

Guest checkout is allowed. Offer create-account after success; do not block pay.

---

## 6. Delivery zone engine

All fees and copy hooks come from `delivery_zones`.

| Zone example | fee_mode | base_price |
| --- | --- | --- |
| Accra Central / East / West / North | calculated | admin-set pesewas |
| Tema / Tema Industrial | calculated | admin-set |
| Other Greater Accra | calculated | admin-set |
| Nationwide Request | on_request | 0 |

Product page delivery block (data-driven):

> **Delivery**  
> Accra & Tema delivery available. Nationwide delivery can be arranged on request.

Do not hardcode `GHS 30` in a component. Admin edits zones in `/admin/delivery`.

---

## 7. Order creation (retail)

1. Validate address + phone + zone (Zod).
2. Re-load variants, tiers, promotions, sellable stock.
3. Reject if any line is `request_quote` or insufficient stock.
4. Compute goods, tax breakdown, delivery fee (or pending nationwide).
5. Insert `orders` + `order_items` snapshots (`source = cart`).
6. If payable now: insert `payments` (`initialized`) and Initialize Paystack with **grand_total**.
7. Return authorization URL. Do not mark paid.
8. Clear cart only after **successful** payment (or immediately after create if you prefer — then restore on failure). Preferred: clear on paid to avoid empty-cart + failed MoMo. If cleared early, keep `order_id` in session.

---

## 8. Paystack (Ghana)

Support: **cards**, **Mobile Money**, hosted checkout / payment links where appropriate.

```text
Customer
  → Create Order (server)
  → Initialize Paystack (server)
  → Paystack Checkout
  → MoMo / Card
  → Webhook
  → Verify payment (server)
  → Order → PAID
```

### Forbidden

```javascript
if (url.includes("success")) {
  order.paid = true
}
```

### Required

- Amount sent to Paystack equals `payments.amount` equals `orders.grand_total` (convert pesewas to the minor unit Paystack expects; keep a single converter).
- Persist `paystack_reference`.
- Webhook: verify signature; insert `payment_events` with unique `provider_event_id`; if duplicate, return 200 and stop.
- Verify transaction with the secret key. Reject amount/reference mismatch.
- MoMo completes **asynchronously**. Browser success is not final.
- Never create a second payment row for the same open order without abandoning the first.
- Never fulfil unpaid orders.
- Log transitions (`initialized → pending → success|failed`).

Return URL: show order status “Confirming payment…” and poll or refresh from DB. Webhook is the source of truth.

Test mode vs live keys follow environments in [ARCHITECTURE.md](ARCHITECTURE.md). Never use live keys against the local DB by accident.

---

## 9. Payment methods beyond Paystack

Retail MVP: Paystack card + MoMo.

Quote-origin orders may also be:

- Bank Transfer
- Purchase Order
- Invoice Terms

Admin marks these. That mark is an **audit-logged** payment event. Inventory follows §10.

---

## 10. Inventory

| Event | Stock effect |
| --- | --- |
| Add to cart / quote draft | None |
| Checkout create (unpaid) | Optional short reserve — **MVP: no reserve until paid** to avoid abandoned-cart lock. Accept oversell risk; warehouse can cancel. |
| Payment success or admin terms confirmed | `reserve` or `fulfil` movement; decrement sellable |
| Cancel / failed | Release if reserved |
| Refund / return | Later; movement `return` |

Warehouse updates `on_hand` via `/admin/inventory` and `inventory_movements`.

---

## 11. Promotions

Server-side `discounts` / `promotion_rules`. Ochre UI for promo badges. Client cannot force a code without server accept.

---

## 12. Emails (retail)

- Order Confirmation (created)
- Payment Confirmation (verified paid)
- Order Processing / Out for Delivery / Delivered
- Admin New Order

Nationwide pending-fee: email that sales will confirm delivery cost.

---

## 13. Cursor must / must not

**Must**

- Keep cart separate from quotes.
- Resolve prices on the server from `price_tiers` + promotions.
- Store VAT-inclusive totals plus `tax_json`.
- Drive delivery from `delivery_zones`.
- Initialize and verify Paystack on the server; idempotent webhooks.
- Decrement inventory only after paid or confirmed terms.

**Must not**

- Trust query parameters for payment success.
- Hardcode shipping in components.
- Charge a invented nationwide fee.
- Use float money.
- Fulfil unpaid orders.
- Hide Add to Quote on product surfaces (retail pages still show both CTAs).
