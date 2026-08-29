# PaperSource — Admin

**Status:** Phase 0. Must not contradict [PRODUCT.md](PRODUCT.md).  
**Purpose:** `/admin` information architecture and RBAC. PaperSource is not operated from the Supabase dashboard.

Authorization rules: [SECURITY.md](SECURITY.md). Quote operations: [RFQ.md](RFQ.md).

---

## 1. Why a first-party admin

Staff must price quotes, confirm nationwide delivery, mark bank/PO/invoice terms, adjust stock, and merchandize the catalogue without SQL.

Supabase Studio is for engineering (migrations, emergencies), not daily sales.

---

## 2. Information architecture

Base path: `/admin`. Server-side role gate on every segment.

```text
Dashboard

Commerce
├── Orders
├── Quotes
├── Customers
└── Organisations

Catalogue
├── Products
├── Categories
├── Brands
├── Inventory
└── Pricing

Marketing
├── Promotions
├── Banners
└── Featured Products

Operations
├── Deliveries
├── Payments
└── Enquiries

Website
├── Pages
├── FAQs
└── Navigation

System
├── Users
├── Roles
├── Logs
└── Settings
```

### Route map

| Nav | Route |
| --- | --- |
| Dashboard | `/admin` |
| Orders | `/admin/orders`, `/admin/orders/[id]` |
| Quotes | `/admin/quotes`, `/admin/quotes/[id]` |
| Customers | `/admin/customers`, `/admin/customers/[id]` |
| Organisations | `/admin/organisations`, `/admin/organisations/[id]` |
| Products | `/admin/products`, `/admin/products/[id]` |
| Categories | `/admin/categories` |
| Brands | `/admin/brands` |
| Inventory | `/admin/inventory` |
| Pricing | `/admin/pricing` (tiers by variant) |
| Promotions | `/admin/promotions` |
| Banners | `/admin/banners` |
| Featured | `/admin/featured` |
| Deliveries | `/admin/deliveries` |
| Payments | `/admin/payments` |
| Enquiries | `/admin/enquiries` |
| Pages | `/admin/pages` |
| FAQs | `/admin/faqs` |
| Navigation | `/admin/navigation` |
| Users | `/admin/users` |
| Roles | `/admin/roles` |
| Logs | `/admin/logs` |
| Settings | `/admin/settings` (VAT rate, quote expiry default, WhatsApp number, site URL) |
| Delivery zones | `/admin/delivery` (zones + fees + `on_request`) |

Visual language: [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) §14. Navy sidebar, dense tables, status chips — not leftover shadcn purple.

---

## 3. Roles

```text
SUPER_ADMIN
ADMIN
SALES
WAREHOUSE
CONTENT_MANAGER
```

Stored in `admin_roles`. Never in user-editable metadata.

| Role | Intent |
| --- | --- |
| SUPER_ADMIN | Break-glass. Roles, settings, all commerce. |
| ADMIN | Run the business day to day. Settings allowed except destroying Auth/project. Cannot grant SUPER_ADMIN unless policy says only existing SUPER_ADMIN can. |
| SALES | Quotes, customers, organisations, enquiries. Cannot change system configuration or wholesale unlock pricing engines they do not need — **can** edit quote line prices. Cannot edit `delivery_zones` globally or Auth roles. |
| WAREHOUSE | Inventory, order fulfilment, deliveries. Cannot edit `price_tiers`, promotions, or catalogue list prices. |
| CONTENT_MANAGER | Product copy/media, categories, brands, pages, FAQs, banners, featured. Cannot edit orders, payments, or quote legal totals. |

---

## 4. RBAC matrix

Legend: **F** full · **R** read · **W** write in-scope · **—** deny

| Area | SUPER | ADMIN | SALES | WAREHOUSE | CONTENT |
| --- | --- | --- | --- | --- | --- |
| Dashboard (aggregated) | F | F | R (own funnel) | R (fulfilment) | R (content) |
| Orders | F | F | R + notes | W fulfilment | — |
| Quotes | F | F | F | R | — |
| Customers | F | F | F | R | — |
| Organisations | F | F | F | R | — |
| Products (content) | F | F | R | R | F |
| Products (prices/tiers) | F | F | R (use in quotes) | — | — |
| Categories / brands | F | F | R | R | F |
| Inventory | F | F | R | F | — |
| Promotions | F | F | R | — | W with ADMIN if needed — **MVP: ADMIN+** |
| Banners / featured | F | F | — | — | F |
| Deliveries | F | F | R | F | — |
| Delivery zone config | F | F | — | — | — |
| Payments (view + mark terms) | F | F | W mark terms on quote-orders | R | — |
| Enquiries | F | F | F | — | R |
| Pages / FAQs / nav | F | F | — | — | F |
| Users / roles | F | R + invite ADMIN? **MVP: SUPER only for roles** | — | — | — |
| Audit logs | F | F | R own | R own | — |
| Settings (VAT, expiry, WhatsApp) | F | F | — | — | — |

**SALES** can modify quotes and should not change database configuration.  
**WAREHOUSE** can update inventory and fulfilment and should not edit prices.

Next.js must enforce this even if a UI control is missing.

---

## 5. Dashboard

MVP widgets (no vanity charts required):

- Open quotes by status (`submitted`, `under_review`, `sent`)
- Orders awaiting payment / nationwide arranging
- Failed Paystack / pending MoMo
- Low stock
- Recent enquiries

Deep links into the relevant table.

---

## 6. Quotes UI (critical)

Quote detail must show:

- Number, status, timeline (`quote_events`)
- Organisation and contact
- Address, zone, requested date
- Line table: SKU, spec, qty, unit price (editable in review/priced), line total
- Attachments (signed download)
- Totals: goods, tax breakdown, delivery, grand total
- Actions: Under review, Save prices, Send, Decline, Revise, Expire, Cancel
- After accept: Pay link status **or** Mark Bank Transfer / PO / Invoice Terms
- Converted `order_id` when present

This is how PaperSource wins against a contact form.

---

## 7. Orders, payments, deliveries

- Filter by source (`cart` | `quote`), status, zone, date.
- Never show “mark paid” without recording provider + reference + audit (Paystack verify or terms).
- Warehouse: processing → out for delivery → delivered.
- Nationwide: `arranging` until fee agreed; then pay link or terms.

---

## 8. Catalogue and pricing

- Product editor: variants, Cloudinary images, EAV attributes, aliases (search), bundle items for office packs.
- Pricing screen: per-variant tiers including `request_quote` open-ended tier.
- Inventory: on_hand adjust with `reason` + movement row. WAREHOUSE home.

---

## 9. Website and settings

CONTENT_MANAGER owns pages, FAQs, navigation labels — not the Next.js route tree itself (engineering).

Settings (ADMIN+):

- Inclusive VAT rate (basis points)
- Default quote expiry days
- WhatsApp business number (support link)
- From-email / Resend from
- Free-shipping defaults only if not fully per-zone

Delivery zone CRUD is settings-adjacent (`/admin/delivery`).

---

## 10. Cursor must / must not

**Must**

- Build `/admin` as the operating interface.
- Enforce the RBAC matrix on the server.
- Give SALES a complete quote review/price/send/revise flow.
- Give WAREHOUSE stock and fulfilment without price edit.

**Must not**

- Tell staff to “just use Supabase” for quotes or orders.
- Hide admin only with CSS.
- Let WAREHOUSE POST `price_tiers`.
- Let SALES change `admin_roles` or global zone table (MVP).
- Ship a generic analytics-only dashboard with no quote queue.
