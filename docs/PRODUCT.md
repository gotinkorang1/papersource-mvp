# PaperSource — Product Specification

**Status:** Product specification; MVP implementation is in progress. See [implementation status](STATUS.md). All other `docs/` files deepen one domain. They must not contradict this file.

**Product:** PaperSource  
**Domain:** papersourcegh.com  
**Position:** Ghana’s modern workplace supply partner.

This document is written as decisions. If a later agent is asked to “build a stationery shop,” it must still follow these rules.

---

## 1. What PaperSource is

PaperSource is a **premium Ghanaian office-supply commerce platform**, not a stationery catalogue with a cart.

It sells workplace supplies to:

| Audience | Typical purchase |
| --- | --- |
| Individual / retail | One notebook, a toner, desk essentials |
| SME | 20 boxes of A4, recurring office restock |
| New company | Office setup supplies |
| School / university | Bulk stationery, classroom packs |
| Organisation | Recurring procurement via RFQ |

It must feel equally comfortable serving all of those on **one product catalogue**.

### Brand feeling

Professional · Reliable · Organised · Modern · Efficient · Approachable

### Taglines

| Use | Line |
| --- | --- |
| Default | Everything your workplace needs. |
| Wordmark lockup | Workplace supplies, simply sourced. |
| B2B / corporate | Smarter sourcing for modern workplaces. |

### What PaperSource is not

- A cheap stationery shop
- A school-bookstore aesthetic
- A WhatsApp-only storefront
- A generic SaaS e-commerce template
- Shopify, WooCommerce, or a single-cart catalogue

---

## 2. The dual-path rule

**PaperSource has two purchasing paths living on the same product catalogue.**

```text
Retail:   browse → cart → checkout → Paystack/MoMo → delivery
Business: browse → quote basket → RFQ → PaperSource reviews/prices → customer accepts → order/payment → delivery
```

Hard constraints:

- Retail cart and quote basket are **separate persisted objects**.
- A user may have both at once. Adding twenty products to a quote must not touch the retail cart.
- Every product surface that can sell must expose **Add to Cart** and **Add to Quote**.
- Quote items are not cart items. Orders created from quotes snapshot quote pricing, not live cart pricing.
- Admin, UX, database, emails, and analytics must treat the two paths as first-class.

Do not collapse this into “a cart with a request-quote checkbox.”

---

## 3. Locked product decisions

| Decision | Lock |
| --- | --- |
| Catalogue | One shared catalogue for retail and procurement |
| Guest checkout | Allowed |
| Guest RFQ | Allowed. Account is optional. Organisation details are collected at submit. |
| Money | Integer **pesewas**. Never floats. Display as `GHS 78.99`. |
| Tax | **VAT-inclusive** display. Customers see one GHS figure. Store a tax breakdown for invoices. |
| Pricing authority | Server only. Resolve from `price_tiers` + promotions. Client displays. |
| Payments | Paystack: cards + Mobile Money. Webhook + server verify. Never trust `?success=` URLs. |
| Delivery | Accra & Tema direct. Nationwide arranged on request. Zone data lives in the database. |
| Addresses | Ghana-first: phone, region, city/town, area/suburb, street/landmark, GhanaPost GPS. |
| Search (MVP) | PostgreSQL full-text + `pg_trgm`. No Algolia/Typesense yet. |
| WhatsApp | Support only (questions, quote discussion, delivery). Not the checkout. |
| Media | Cloudinary for public product images. Supabase Storage for private documents. |

Launch delivery sentence (copy may vary; the **rule** is data-backed):

> PaperSource provides direct delivery across Accra and Tema. Orders outside these areas are supported through nationwide delivery arranged on request.

---

## 4. User roles

### Storefront

| Role | Who | Can |
| --- | --- | --- |
| Guest | Unauthenticated visitor | Browse, search, cart, guest checkout, guest RFQ, WhatsApp contact |
| Customer | Authenticated individual | Everything a guest can, plus saved addresses, order/quote history, optional organisation join |
| Organisation member | Customer linked to an organisation | Quote and order on behalf of that organisation; later: reorder (out of MVP) |

Organisation types: Business, School, Government, NGO, Hospital, Church, University, Retailer, Other.

### Admin (RBAC from day one)

| Role | Scope |
| --- | --- |
| SUPER_ADMIN | Everything, including roles and system settings |
| ADMIN | Operate the business; no destructive system/config beyond agreed settings |
| SALES | Quotes, customers, organisations, enquiries. Cannot change system config or wholesale price lists they do not own |
| WAREHOUSE | Inventory, fulfilment, deliveries. Cannot edit prices or promotions |
| CONTENT_MANAGER | Products (content/media), categories, brands, pages, FAQs, banners. Cannot edit orders or payments |

Full matrix: [ADMIN.md](ADMIN.md).

---

## 5. Public sitemap

Every route lists purpose and primary CTA.

### Marketing / storefront

| Route | Purpose | Primary CTA |
| --- | --- | --- |
| `/` | Editorial homepage. Category grid, dual-path story, Accra/Tema delivery rule | Shop Products / Request Bulk Quote |
| `/shop` | Full catalogue | Filter + add to cart/quote |
| `/shop/[category]` | Indexable category (paper, writing, printer-supplies, …) | Shop category |
| `/product/[slug]` | Product + variants, tiers, compatibility, dual CTAs, JSON-LD | Add to Cart / Add to Quote |
| `/brands` | Brand index | Open brand |
| `/brands/[slug]` | Brand catalogue (HP, Canon, Double A, …) | Shop brand |
| `/search` | Universal search (name, SKU, barcode, brand, category, alias) | Open result |
| `/cart` | Retail cart only | Checkout |
| `/business` | Procurement narrative + 4-step quote story | Start a Quote |
| `/bulk-orders` | Bulk / nationwide / school-org entry | Request Bulk Quote |
| `/schools` | School-specific merchandising + RFQ | Request a School Quote |
| `/corporate-accounts` | Organisation accounts explanation | Create account / Start a Quote |
| `/request-quote` | Start or continue RFQ from quote basket | Submit RFQ |
| `/quote` | Quote basket (guest or signed-in) | Request quotation |
| `/quote/[id]` | Submitted/priced quote (token or auth) | Accept / Pay / Discuss |
| `/office-packs` | Bundle merchandising | Add pack to cart/quote |

### Checkout and orders

| Route | Purpose | Primary CTA |
| --- | --- | --- |
| `/checkout` | Retail checkout. Ghana address + delivery zone | Pay with Paystack |
| `/order/[id]` | Order confirmation / status (auth or secret token) | View delivery / Pay if pending |
| `/checkout/nationwide` | Soft landing when zone = Nationwide Request | We will contact you |

### Company

| Route | Purpose | Primary CTA |
| --- | --- | --- |
| `/about` | Brand and capability | Shop / Request a Quote |
| `/delivery` | Accra & Tema + nationwide-on-request, zones, times | Shop |
| `/contact` | Phone, email, WhatsApp, form | Send / WhatsApp |
| `/faq` | Delivery, quotes, payments, returns | Contact |
| `/terms` | Terms of sale | — |
| `/privacy` | Privacy | — |
| `/returns` | Returns / damaged goods | Contact |

### Account

| Route | Purpose | Primary CTA |
| --- | --- | --- |
| `/account` | Overview | — |
| `/account/orders` | Order history | View order |
| `/account/quotes` | Quote history | View quote |
| `/account/addresses` | Saved Ghana addresses | Add address |
| `/account/organisation` | Create or view organisation | Save |

### Admin

Base: `/admin`. See [ADMIN.md](ADMIN.md).

| Area | Routes |
| --- | --- |
| Home | `/admin` |
| Commerce | `/admin/orders`, `/admin/quotes`, `/admin/customers`, `/admin/organisations` |
| Catalogue | `/admin/products`, `/admin/categories`, `/admin/brands`, `/admin/inventory`, `/admin/pricing` |
| Marketing | `/admin/promotions`, `/admin/banners`, `/admin/featured` |
| Operations | `/admin/deliveries`, `/admin/payments`, `/admin/enquiries` |
| Website | `/admin/pages`, `/admin/faqs`, `/admin/navigation` |
| System | `/admin/users`, `/admin/roles`, `/admin/logs`, `/admin/settings` |

---

## 6. Homepage structure

Do not use the generic NAV → giant hero → featured products → newsletter → footer template.

### Navigation

```text
PaperSource · Shop · Categories · Brands · Business · Schools · Bulk Orders
Search… · Request a Quote · Account · Cart · Quote List
```

Cart and Quote List are **visibly separate** (counts independent).

### Hero

Large editorial typography:

> Everything your workplace needs.  
> Office stationery, paper, printing supplies and workplace essentials — delivered across Accra & Tema.

Buttons: **Shop Products** · **Request Bulk Quote**  
Subline: Nationwide supply available on request.

### Category navigation (visually dominant)

Shop the workplace: Paper, Writing, Filing, Printing, Desk Essentials, Technology, School Supplies, Workplace Essentials.  
Use product photography, not generic icons everywhere.

### Business band (Ink Navy)

> Procurement without the paperwork headache.

01 Build your list → 02 Request quotation → 03 Approve pricing → 04 We deliver.  
CTA: **Start a Quote**

WhatsApp may appear in header/footer as support. It must not replace Shop or Request a Quote.

---

## 7. Catalogue

### Initial taxonomy

| Division | Children |
| --- | --- |
| Paper | Copier Paper, Coloured Paper, Cardstock, Labels, Sticky Notes |
| Writing | Pens, Pencils, Markers, Highlighters, Correction Products |
| Filing & Organisation | Files, Folders, Binders, Document Wallets, Archive Boxes |
| Desk Essentials | Staplers, Punches, Tape, Scissors, Rulers, Calculators |
| Printing | Ink Cartridges, Toners, Printer Accessories |
| Office Technology | Keyboards, Mice, Flash Drives, Extension Boards, Headsets |
| School Supplies | Exercise Books, Geometry Sets, Art Supplies, Writing Materials |
| Workplace Essentials | Whiteboards, Notice Boards, Cleaning Supplies, Batteries, Storage |

Office Furniture is **out of MVP** as a major division.

### Product attributes

Do not add fifty columns to `products`. Use flexible attributes per category.

| Family | Example attributes |
| --- | --- |
| Paper | Size, GSM, Sheets, Colour, Finish, Brightness, Pack Size |
| Pens | Ink Colour, Tip Size, Type, Pack Quantity |
| Toners | Brand, Colour, Yield, Compatible Printer Models, OEM / Compatible |
| Files | Size, Colour, Material, Capacity, Pack Quantity |

### Pricing tiers (per variant, not global)

Example — A4 copy paper:

```text
1–4 reams     GHS 78.00
5–19 reams    GHS 75.00
20–49 reams   GHS 71.50
50+ reams     Request Quote
```

A “request quote” tier is a first-class tier (`unit_price` null + flag), not a hardcoded UI string.

### Product card (non-negotiable)

Do not ship a generic card (image, name, price, add to cart).

Required information:

```text
Double A Premium A4 Paper
A4 • 80gsm • 500 sheets
GHS 78.00 / ream
10+     GHS 74.50
50+     Request bulk price
✓ In Stock
[ Add to Cart ]  [ Add to Quote ]
```

### Office packs (MVP merchandising)

Bundle product type. Seed at least:

- New Employee Starter Pack
- Small Office Starter Pack
- Classroom Pack

Also defined for later merchandising: Reception Desk, Meeting Room, Remote Worker.

### Search

Must match: product names, SKU, barcode, brands, categories, tags, compatibility aliases (e.g. `HP 305 black`, `A4 80gsm`, `Canon 067 cyan`).

### Quick Order (MVP)

SKU / product + quantity grid → **Add all to Quote** (and optionally add all to cart). Built for procurement staff.

---

## 8. Retail path

```text
Browse → Cart → Checkout → Paystack (card / MoMo) → Webhook verify → Order PAID → Delivery
```

1. Guest or customer adds variants to **cart**.
2. Checkout collects Ghana address + phone (required) + optional GhanaPost GPS.
3. Customer selects a **delivery zone** from the database (Accra / Tema zones, or Other Region → Nationwide Request).
4. Other Region changes the flow: PaperSource contacts the customer to confirm nationwide option and cost. Do not silently invent a shipping fee.
5. Server recomputes line totals from live tiers + promotions. VAT-inclusive grand total. Tax breakdown persisted.
6. Server creates the order in a payable state, then initialises Paystack.
7. Customer pays via Paystack Checkout (card or MoMo).
8. **Only** webhook + server verification mark the order paid. MoMo is asynchronous.
9. Inventory decrements after paid (or after admin confirms terms on a quote-origin order — see [ECOMMERCE.md](ECOMMERCE.md)).
10. Emails: order confirmation, payment confirmation, then operational updates.

Details: [ECOMMERCE.md](ECOMMERCE.md).

---

## 9. Business path (RFQ)

```text
Browse → Quote basket → Customer info → Optional uploads → Submit RFQ
  → Under review → Priced → Sent → Accepted → Payment or terms → Order → Delivery
```

Guests may submit. Collect:

- Organisation name (and type)
- Contact person, phone, email
- Delivery location
- Requested delivery date
- Notes
- Optional files: PDF, Excel, Word, image, purchase order, procurement list, RFQ document

Statuses (happy path):

```text
DRAFT → SUBMITTED → UNDER_REVIEW → PRICED → SENT → ACCEPTED
  → PAYMENT_PENDING → PAID → ORDER_CREATED
```

Other paths: `DECLINED`, `EXPIRED`, `CANCELLED`, `REVISED`.

After PaperSource prices a quote, the customer gets **Accept Quote**, then **Pay Now**, or admin marks Bank Transfer / Purchase Order / Invoice Terms. Accepted quotes generate orders. Revisions are retained.

Quotes are business objects, not contact-form enquiries.

Details: [RFQ.md](RFQ.md).

---

## 10. Admin surface

Do not operate the business from the Supabase dashboard.

`/admin` is PaperSource’s own interface:

```text
Dashboard
Commerce     Orders · Quotes · Customers · Organisations
Catalogue    Products · Categories · Brands · Inventory · Pricing
Marketing    Promotions · Banners · Featured Products
Operations   Deliveries · Payments · Enquiries
Website      Pages · FAQs · Navigation
System       Users · Roles · Logs · Settings
```

Sales can modify quotes. Warehouse can fulfil and adjust stock. Neither should change database configuration.

Details: [ADMIN.md](ADMIN.md).

---

## 11. Design language (summary)

Full system: [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md).

| Role | Colour | Hex |
| --- | --- | --- |
| Primary | Ink Navy | `#102A43` |
| Secondary | Paper Green | `#1F6B57` |
| Accent | Golden Ochre | `#E6A329` |
| Background | Paper Cream | `#F8F6F1` |
| Surface | Pure Paper | `#FFFFFF` |
| Primary text | Graphite | `#20262E` |
| Secondary text | Slate | `#667085` |
| Borders | Soft Grey | `#E4E7EC` |
| Success | Green | `#15803D` |
| Error | Red | `#B42318` |

Usage: **70% cream/white + 20% navy/graphite + 7% green + 3% gold.** Green and ochre must not dominate.

Inspiration: paper, document grids, filing systems, office organisation.  
Avoid: giant pencils, cartoon notebooks, rainbow stationery, shopping-cart illustrations, generic blue SaaS gradients.

Typography: **Manrope** (headings) + **Inter** (body/UI).  
Logo: PaperSource wordmark + PS symbol (P + S + two stacked sheets + subtle folded corner). Must not resemble Microsoft Office or a printer icon.

Mobile bottom nav: Home · Shop · Search · Quote · Cart.

---

## 12. Entity inventory

Full schema: [DATABASE.md](DATABASE.md).

```text
users · profiles · organizations · organization_members · addresses
categories · brands · products · product_variants · product_images
product_attributes · inventory · inventory_movements · price_tiers
carts · cart_items · quotes · quote_items · quote_events
orders · order_items · payments · payment_events
delivery_zones · deliveries · discounts · promotion_rules
enquiries · uploaded_documents · reviews · wishlists
notifications · audit_logs
```

---

## 13. Analytics and monitoring

Install from the beginning:

- **Vercel Analytics**
- **Sentry** (checkout, webhooks, server actions, email, DB)

Track at least:

```text
product_viewed
search_performed
add_to_cart
add_to_quote
quote_started
quote_submitted
checkout_started
payment_started
purchase_completed
product_not_found
```

PaperSource metrics that matter besides retail conversion:

- Product → Quote conversion
- Quote → Accepted conversion

PostHog is **out of MVP**.

---

## 14. Emails (MVP)

Resend + React Email. Templates:

```text
Welcome
Order Confirmation · Payment Confirmation
Quote Received · Quote Ready · Quote Revised · Quote Accepted · Quote Expiring
Order Processing · Out for Delivery · Delivered
Password Reset
Admin New Order · Admin New RFQ
```

---

## 15. MVP acceptance criteria

A later agent may not mark MVP complete unless all of the following are true.

### Dual path

- [ ] Cart and quote basket are separate persisted objects with independent counts in the header.
- [ ] Product cards and product pages show unit, pack/spec line, tier preview, stock, **Add to Cart**, and **Add to Quote**.
- [ ] Adding to one path never mutates the other.

### Retail

- [ ] Guest checkout works with Ghana address fields; phone is required.
- [ ] Delivery zones load from the database. Accra/Tema calculate a fee. Nationwide Request does not invent a fee; it changes the flow.
- [ ] Server recomputes prices from `price_tiers` before creating a payable order.
- [ ] Paystack initialises on the server. Card and MoMo are offered.
- [ ] Order is marked paid only after webhook + verification. Idempotent. MoMo async is handled.
- [ ] Displayed totals are VAT-inclusive. A tax breakdown is stored on the order.

### RFQ

- [ ] Guest can submit an RFQ with organisation + contact + delivery + notes.
- [ ] Optional document upload (PDF, Excel, Word, image) to private storage.
- [ ] Quote numbers (e.g. `RFQ-2026-000238` / `PSQ-00219`) and the full status machine exist.
- [ ] Sales can price, send, decline, expire, cancel, and revise (revision retained).
- [ ] Customer can accept a sent quote. Accept → Pay Now **or** admin terms (bank transfer / PO / invoice terms).
- [ ] Accepted + paid (or terms-confirmed) quote creates an order that snapshots quote prices.

### Catalogue and search

- [ ] Categories and brands are indexable routes.
- [ ] Variants have per-variant price tiers, including a request-quote tier.
- [ ] Flexible attributes exist (paper / pens / toner / files at minimum).
- [ ] Search matches name, SKU, barcode, brand, category, and aliases via Postgres FTS + `pg_trgm`.
- [ ] Quick Order adds a SKU list to the quote basket.
- [ ] At least three office packs exist as bundles.

### Admin and security

- [ ] `/admin` implements the navigation tree. Supabase dashboard is not required to operate quotes or orders.
- [ ] RBAC: SALES cannot change system settings; WAREHOUSE cannot edit prices.
- [ ] RLS on every exposed table. Service role never shipped to the client.
- [ ] Private documents use signed URLs.

### Delivery, SEO, quality

- [ ] Delivery copy on product and checkout is driven by zone data, not hardcoded strings only.
- [ ] Product pages emit canonical, Open Graph, breadcrumbs, and Product JSON-LD (offer, availability, brand, SKU).
- [ ] WhatsApp is support, not checkout.
- [ ] Critical Playwright flows in [TESTING.md](TESTING.md) pass.
- [ ] Sentry and Vercel Analytics are installed.

---

## 16. Out of MVP

Do not build these until a later phase explicitly asks:

- Reorder / Buy Again
- Customer credit ledgers or running accounts
- Algolia, Typesense, Meilisearch, Elasticsearch
- Office Furniture as a major division
- PostHog
- Custom wordmark lettering (use Manrope lockup)
- GraphQL, Redux, microservices, Kubernetes
- Shopify headless, WooCommerce, WordPress
- Firebase or MongoDB
- Thin doorway SEO pages
- Guest-to-WhatsApp checkout as the primary path

---

## 17. Companion documents

| Document | Domain |
| --- | --- |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Stack, folders, environments, non-stack |
| [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) | Colour, type, components, motion, anti-patterns |
| [DATABASE.md](DATABASE.md) | Entities, money, enums, Ghana addresses, zones |
| [SECURITY.md](SECURITY.md) | RLS, roles, secrets, webhooks, storage |
| [ECOMMERCE.md](ECOMMERCE.md) | Cart, pricing, VAT, Paystack, delivery, inventory |
| [RFQ.md](RFQ.md) | Quote basket, guest RFQ, state machine, quote→order |
| [ADMIN.md](ADMIN.md) | `/admin` IA and RBAC matrix |
| [SEO.md](SEO.md) | Queries, routes, JSON-LD |
| [TESTING.md](TESTING.md) | Vitest, RTL, Playwright, browser verification |

---

## 18. Cursor must / must not

**Must**

- Treat this file as the product source of truth.
- Keep retail cart and quote basket separate.
- Store money as integer pesewas.
- Compute final prices on the server.
- Drive delivery fees and nationwide behaviour from `delivery_zones`.
- Verify Paystack on the server; treat MoMo as async.
- Show procurement-grade product cards.

**Must not**

- Build a generic stationery theme.
- Hardcode Accra shipping in components.
- Trust query parameters for payment success.
- Store `78.99` as a float.
- Replace checkout or RFQ with “click WhatsApp to buy.”
- Skip admin and operate only from Supabase UI.
- Introduce Algolia, Redux, GraphQL, or Shopify in MVP.
