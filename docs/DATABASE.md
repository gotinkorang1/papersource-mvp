# PaperSource — Database

**Status:** Phase 0. Must not contradict [PRODUCT.md](PRODUCT.md).  
**Purpose:** Relational model for a dual-path commerce platform. Implement with Drizzle on Supabase PostgreSQL.

Money is **integer pesewas**. There are **no floating-point price columns**.

---

## 1. Conventions

| Topic | Rule |
| --- | --- |
| IDs | UUID primary keys (`gen_random_uuid()`) unless a human number is specified |
| Timestamps | `timestamptz`, `created_at` / `updated_at` |
| Money | `integer` pesewas. `7899` displays as `GHS 78.99` |
| Currency | `currency char(3)` default `'GHS'` on money rows |
| Soft delete | `deleted_at` on catalogue and organisations where history matters |
| Slugs | Unique, URL-safe, on categories, brands, products |
| Snapshots | Quote and order lines copy name, SKU, unit price, tax — do not bind legal totals to live catalogue |
| Search | `tsvector` + `pg_trgm` GIN indexes on product name, SKU, barcode, aliases |
| RLS | Every exposed table. Policies in [SECURITY.md](SECURITY.md) |

Never store `78.99` as `numeric`/`float` for prices. If a decimal type is tempting, stop.

---

## 2. Entity list (MVP)

```text
users                  (Supabase Auth)
profiles
organizations
organization_members
addresses
categories
brands
products
product_variants
product_images
product_attributes
product_aliases
inventory
inventory_movements
price_tiers
carts
cart_items
quotes
quote_items
quote_events
orders
order_items
payments
payment_events
delivery_zones
deliveries
discounts
promotion_rules
enquiries
uploaded_documents
reviews
wishlists
notifications
audit_logs
admin_roles
```

`wishlists` and `reviews` may be schema-ready in MVP with UI deferred if time-boxed — tables should exist so the model stays complete. Prefer implementing reviews as optional UI; do not block dual-path on them.

---

## 3. Identity and organisations

### profiles

Extends `auth.users`.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | = `auth.users.id` |
| full_name | text | |
| phone | text | E.164 or local GH; required at checkout |
| email | text | Denormalised for admin search |
| created_at / updated_at | timestamptz | |

Do not store admin roles on a user-editable profile field. Roles: [SECURITY.md](SECURITY.md).

### organizations

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| name | text not null | |
| email | text | |
| phone | text | |
| industry | text | |
| type | enum | `business`, `school`, `government`, `ngo`, `hospital`, `church`, `university`, `retailer`, `other` |
| registration_number | text | |
| tax_number | text | |
| default_address_id | uuid FK | optional |
| credit_status | enum | `none`, `pending`, `approved`, `suspended` — **no credit ledger in MVP** |
| created_at / updated_at | timestamptz | |

Guests submitting RFQs create a lightweight organisation row (or a pending org) from the form. They do not need an account first.

### organization_members

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| organization_id | uuid FK | |
| profile_id | uuid FK | |
| role | enum | `owner`, `member` |
| created_at | timestamptz | |

Unique `(organization_id, profile_id)`.

### addresses

Ghana-first. Used by profiles, organisations, checkouts, quotes.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| owner_profile_id | uuid FK nullable | |
| organization_id | uuid FK nullable | |
| full_name | text not null | |
| phone | text not null | Extremely important |
| region | text not null | |
| city_town | text not null | |
| area_suburb | text | |
| street_landmark | text | |
| ghanapost_gps | text | e.g. `GA-123-4567` |
| delivery_instructions | text | |
| is_default | boolean | |
| created_at / updated_at | timestamptz | |

No `zip`, `state`, or `postal_code` as required US-style fields.

---

## 4. Catalogue

### categories

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| parent_id | uuid FK nullable | Division vs child |
| name | text | |
| slug | text unique | `/shop/[slug]` |
| description | text | |
| position | int | |
| image_public_id | text | Cloudinary |
| active | boolean | |

Seed the taxonomy in [PRODUCT.md](PRODUCT.md) §7.

### brands

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| name | text | |
| slug | text unique | `/brands/[slug]` |
| logo_public_id | text | |
| active | boolean | |

### products

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| name | text not null | |
| slug | text unique | `/product/[slug]` |
| brand_id | uuid FK | |
| category_id | uuid FK | Primary category |
| product_type | enum | `standard`, `bundle` |
| description | text | |
| status | enum | `draft`, `active`, `archived` |
| search_document | tsvector | Generated/maintained |
| created_at / updated_at | timestamptz | |

Office packs are `product_type = bundle` plus a `product_bundle_items` table (`bundle_product_id`, `variant_id`, `quantity`).

### product_variants

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| product_id | uuid FK | |
| sku | text unique | Quick Order key |
| barcode | text | |
| name | text | e.g. colour / pack |
| unit_label | text | `ream`, `box`, `pack`, `each` |
| base_unit_price | int | Pesewas, VAT-inclusive list for qty 1 if no tier matches |
| currency | char(3) | `GHS` |
| active | boolean | |

`base_unit_price` is the fallback list price. Selling price is resolved from `price_tiers` on the server.

### product_images

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| product_id | uuid FK | |
| variant_id | uuid FK nullable | Optional override |
| cloudinary_public_id | text not null | |
| alt | text | |
| position | int | |

### product_attributes (EAV)

Do not add Size/GSM/Yield columns to `products`.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| product_id | uuid FK | |
| variant_id | uuid FK nullable | Variant-specific |
| namespace | text | `paper`, `pen`, `toner`, `file`, … |
| key | text | `gsm`, `size`, `compatible_models` |
| value_text | text | |
| value_num | int nullable | Optional typed value |
| position | int | |

Toner compatibility strings also feed `product_aliases` and search.

### product_aliases

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| product_id | uuid FK | |
| variant_id | uuid FK nullable | |
| alias | text | `HP 305 black`, `A4 80gsm` |

### price_tiers

Per **variant**. Not a global hardcoded matrix.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| variant_id | uuid FK | |
| minimum_quantity | int not null | Inclusive |
| maximum_quantity | int nullable | Null = open-ended |
| unit_price | int nullable | Pesewas VAT-inclusive. Null if request-quote |
| request_quote | boolean | `true` for 50+ style tiers |
| currency | char(3) | `GHS` |
| active | boolean | |

Example:

```text
1–4     7800
5–19    7500
20–49   7150
50+     unit_price null, request_quote true
```

Tiers must not overlap on the same variant. Enforce in application logic and a constraint or exclusion where practical.

---

## 5. Inventory

### inventory

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| variant_id | uuid FK unique | |
| on_hand | int not null default 0 | |
| reserved | int not null default 0 | MVP: reserve on paid/terms, not on quote draft |
| low_stock_threshold | int | |

Sellable = `on_hand - reserved`. Display badges from this.

### inventory_movements

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| variant_id | uuid FK | |
| delta | int | Signed |
| reason | enum | `receive`, `adjust`, `reserve`, `release`, `fulfil`, `return` |
| reference_type | text | `order`, `quote`, `admin` |
| reference_id | uuid | |
| created_by | uuid nullable | |
| created_at | timestamptz | |

Decrement / reserve **after** payment or admin-confirmed terms. Do not decrement on add-to-cart or quote draft.

---

## 6. Delivery zones

Do not hardcode shipping in components.

### delivery_zones

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| name | text | Accra Central, Tema, … |
| region | text | Greater Accra, Nationwide, … |
| code | text unique | `accra_central`, `nationwide_request` |
| base_price | int | Pesewas. **0** for nationwide request |
| fee_mode | enum | `calculated`, `on_request` |
| free_shipping_threshold | int nullable | Pesewas, VAT-inclusive cart/quote goods |
| estimated_min_days | int | |
| estimated_max_days | int | |
| active | boolean | |
| sort_order | int | |

`fee_mode = on_request` is the launch nationwide rule: no invented fee; checkout/quote changes flow.

Seed (initial):

```text
Accra Central
Accra East
Accra West
Accra North
Tema
Tema Industrial Area
Other Greater Accra
Nationwide Request     fee_mode = on_request
```

Site copy (“Accra & Tema delivery available…”) is allowed as UX, but **fees and Other Region behaviour** read this table.

### deliveries

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| order_id | uuid FK | |
| zone_id | uuid FK | |
| status | enum | `pending`, `arranging`, `out_for_delivery`, `delivered`, `cancelled` |
| quoted_fee | int | Snapshot pesewas |
| scheduled_date | date nullable | |
| notes | text | |

---

## 7. Cart (retail only)

### carts

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| profile_id | uuid FK nullable | |
| session_id | text nullable | Guest cookie |
| created_at / updated_at | timestamptz | |

One open cart per profile; guests keyed by `session_id`. Merge on login.

### cart_items

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| cart_id | uuid FK | |
| variant_id | uuid FK | |
| quantity | int | |

Cart lines are **not** quote lines. No quote_id here.

Displayed cart money is a **preview**. Legal totals are computed at checkout on the server.

---

## 8. Quotes

### quotes

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| number | text unique | `RFQ-2026-000238` or `PSQ-00219` — pick one scheme and stick to it. Recommended: `PSQ-YYYY-######` public, internal increment. |
| status | enum | See §8.1 |
| profile_id | uuid FK nullable | Null if guest |
| guest_email | text | Required if no profile |
| guest_phone | text | |
| organization_id | uuid FK nullable | Created at submit if needed |
| contact_name | text | |
| delivery_address_id | uuid FK nullable | Or snapshot columns |
| delivery_zone_id | uuid FK nullable | |
| requested_delivery_date | date | |
| notes | text | |
| currency | char(3) | `GHS` |
| goods_total | int | Pesewas VAT-inclusive snapshot when priced |
| tax_total | int | Breakdown total (inclusive split) |
| tax_json | jsonb | Rate lines for invoice |
| delivery_fee | int | 0 if on_request / TBD |
| delivery_fee_status | enum | `calculated`, `pending_nationwide`, `waived` |
| grand_total | int | |
| expires_at | timestamptz nullable | |
| parent_quote_id | uuid FK nullable | Previous revision |
| order_id | uuid FK nullable | Set on ORDER_CREATED |
| created_at / updated_at | timestamptz | |

Guest RFQ: `profile_id` may be null; `guest_email` + `guest_phone` + organisation required.

### quote_items

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| quote_id | uuid FK | |
| variant_id | uuid FK | Live link for admin; may be null if custom line |
| name_snapshot | text | |
| sku_snapshot | text | |
| spec_snapshot | text | |
| quantity | int | |
| unit_price | int nullable | Null until priced or if still request-quote |
| line_total | int nullable | |
| notes | text | |

Items snapshot product information at submit and again when sales prices the quote.

### quote_events

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| quote_id | uuid FK | |
| from_status | text nullable | |
| to_status | text | |
| actor_type | enum | `customer`, `guest`, `admin`, `system` |
| actor_id | uuid nullable | |
| payload | jsonb | |
| created_at | timestamptz | |

### 8.1 Quote status enum

Happy path:

```text
draft
submitted
under_review
priced
sent
accepted
payment_pending
paid
order_created
```

Other paths (first-class, not booleans):

```text
declined
expired
cancelled
revised
```

`revised` marks the **superseded** quote. The new row is a child with `parent_quote_id`. Do not overwrite priced lines in place if the customer already saw them — clone.

State machine and transitions: [RFQ.md](RFQ.md).

---

## 9. Orders and payments

### orders

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| number | text unique | Human-facing |
| source | enum | `cart`, `quote` |
| quote_id | uuid FK nullable | |
| profile_id | uuid FK nullable | |
| organization_id | uuid FK nullable | |
| status | enum | `pending_payment`, `awaiting_terms`, `paid`, `processing`, `out_for_delivery`, `delivered`, `cancelled` |
| currency | char(3) | |
| goods_total | int | VAT-inclusive |
| tax_total | int | Inclusive breakdown |
| tax_json | jsonb | |
| delivery_fee | int | |
| discount_total | int | |
| grand_total | int | Amount charged / due |
| address_snapshot | jsonb | Full Ghana address |
| delivery_zone_id | uuid FK | |
| created_at / updated_at | timestamptz | |

Quote-origin orders copy quote snapshots. They do **not** re-price from live tiers unless sales explicitly reopens.

### order_items

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| order_id | uuid FK | |
| variant_id | uuid FK nullable | |
| name_snapshot | text | |
| sku_snapshot | text | |
| quantity | int | |
| unit_price | int | Pesewas VAT-inclusive |
| line_total | int | |
| tax_total | int | |

### payments

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| order_id | uuid FK | |
| provider | text | `paystack`, `bank_transfer`, `purchase_order`, `invoice_terms` |
| status | enum | `initialized`, `pending`, `success`, `failed`, `abandoned` |
| amount | int | Pesewas |
| currency | char(3) | |
| paystack_reference | text unique nullable | |
| authorization_url | text nullable | |
| raw_init | jsonb | |
| created_at / updated_at | timestamptz | |

### payment_events

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| payment_id | uuid FK | |
| provider_event_id | text unique | Idempotency key (Paystack event id) |
| event_type | text | |
| payload | jsonb | |
| processed_at | timestamptz | |

Never fulfil from a row that is not `success` after verify. Details: [ECOMMERCE.md](ECOMMERCE.md).

---

## 10. Promotions, content, files

### discounts / promotion_rules

Enough to support featured/promo badges and simple percent or amount off. Engine is server-side. Do not apply promotions only in the client.

Suggested: `discounts` (code, type, value pesewas or bps, active, window) and `promotion_rules` (applies to category/product/min qty).

### enquiries

Contact form and leftover questions (not quotes).

### uploaded_documents

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| owner_profile_id | uuid nullable | |
| organization_id | uuid nullable | |
| quote_id | uuid nullable | |
| order_id | uuid nullable | |
| bucket | text | Supabase Storage |
| path | text | |
| filename | text | |
| mime | text | |
| purpose | enum | `rfq`, `purchase_order`, `procurement_list`, `invoice`, `internal` |
| created_at | timestamptz | |

Private bucket. Signed URLs only. [SECURITY.md](SECURITY.md).

### notifications / audit_logs

In-app or email-outbox optional. `audit_logs` for admin mutations (who changed price, quote status, stock).

### admin_roles

| Column | Type | Notes |
| --- | --- | --- |
| profile_id | uuid PK/FK | |
| role | enum | `super_admin`, `admin`, `sales`, `warehouse`, `content_manager` |

Authoritative store for staff. Also mirrored to Auth app_metadata **by server only**.

---

## 11. Tax storage

Catalogue `unit_price` / tier prices are **VAT-inclusive**.

On quotes and orders persist:

| Field | Meaning |
| --- | --- |
| goods_total | What the customer sees for goods |
| tax_total | VAT (and any configured levies) **portion** of the inclusive total |
| tax_json | Lines: `{ name, rate_bps, amount }` |
| grand_total | Goods + delivery (delivery VAT treatment: include in breakdown when fee is calculated) |

Customers see **one GHS figure**. Invoices can print the split. Rate configuration lives in settings (not hardcoded in cards). Default Ghana VAT rate is configured in admin settings, not in React.

---

## 12. Search

- `pg_trgm` on `products.name`, `product_variants.sku`, `barcode`, `product_aliases.alias`, brand and category names
- `tsvector` on a generated document (name, brand, category, attributes, aliases)
- Do not add Algolia/Typesense tables in MVP

---

## 13. Cursor must / must not

**Must**

- Use integer pesewas for every money column.
- Keep `carts` / `cart_items` separate from `quotes` / `quote_items`.
- Snapshot quote and order lines.
- Model quote statuses as an enum matching [RFQ.md](RFQ.md).
- Store Ghana address fields; phone required.
- Put delivery fees in `delivery_zones` with `on_request` for nationwide.
- Use EAV attributes, not fifty product columns.

**Must not**

- Add `price numeric(10,2)` or float money.
- Mix quote lines into the cart table.
- Hard-delete priced quotes when revising.
- Require `postal_code` as a US ZIP.
- Decrement inventory on draft cart or draft quote.
