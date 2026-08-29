# PaperSource — Design System

**Status:** Phase 0. Must not contradict [PRODUCT.md](PRODUCT.md).  
**Purpose:** Prevent a generic AI e-commerce theme. PaperSource should look like a modern procurement catalogue / editorial design system.

---

## 1. Brand position in the UI

PaperSource is **Ghana’s modern workplace supply partner.**

The interface should feel:

Professional · Reliable · Organised · Modern · Efficient · Approachable

It must be equally comfortable for:

- one notebook
- 20 boxes of A4
- a new-company office setup
- bulk school stationery
- recurring organisational procurement

Visual inspiration: **paper, document grids, filing systems, office organisation.**  
Think large typography, crisp grids, beautiful product photography, paper-like surfaces, subtle lines, tabs, labels, and strong whitespace.

---

## 2. Colour system

| Role | Name | Hex | Use |
| --- | --- | --- | --- |
| Primary | Ink Navy | `#102A43` | Wordmark, headers, primary buttons, business band, admin chrome |
| Secondary | Paper Green | `#1F6B57` | In-stock, trust marks, secondary emphasis. Sparse. |
| Accent | Golden Ochre | `#E6A329` | Promotions, bulk-discount highlights, featured, quote-status accents, small graphics |
| Background | Paper Cream | `#F8F6F1` | Page background. Stops a generic white shop look. |
| Surface | Pure Paper | `#FFFFFF` | Cards, sheets, drawers, admin tables |
| Primary text | Graphite | `#20262E` | Headings and body |
| Secondary text | Slate | `#667085` | Meta, specs, placeholders |
| Borders | Soft Grey | `#E4E7EC` | Rules, tables, inputs |
| Success | Green | `#15803D` | Paid, delivered, success toasts |
| Error | Red | `#B42318` | Errors, declined, out of stock (when severe) |

**Mix:** 70% cream/white + 20% navy/graphite + 7% green + 3% gold.

Navy gives corporate credibility. Green communicates reliability and maturity. Paper cream is the differentiator. Ochre highlights — it is not a brand fill.

Do not invert this into a green or yellow website. Do not add a second navy-blue or a SaaS purple.

### Semantic tokens (when scaffolding)

```text
--ps-ink            #102A43
--ps-paper-green    #1F6B57
--ps-ochre          #E6A329
--ps-cream          #F8F6F1
--ps-surface        #FFFFFF
--ps-graphite       #20262E
--ps-slate          #667085
--ps-border         #E4E7EC
--ps-success        #15803D
--ps-error          #B42318
```

---

## 3. Typography

| Role | Family | Notes |
| --- | --- | --- |
| Headings | **Manrope** | Editorial, large, confident. Tight tracking on hero. |
| Body / UI | **Inter** | Forms, tables, product meta, admin |
| Wordmark (MVP) | Manrope, uppercase or small-caps lockup | Custom lettering is out of MVP |
| Mono (SKU / GPS) | System ui-monospace or IBM Plex Mono if added later | SKUs, GhanaPost GPS, quote numbers |

Hierarchy: one obvious page title, a short supporting line, then product or category content. Do not stack five competing heading sizes on the homepage hero.

Alternative (do not mix without a written change): DM Sans + Inter.

---

## 4. Logo lockup

**PAPERSOURCE** wordmark + **PS** symbol.

The symbol may combine:

- P
- S
- two stacked sheets of paper
- a subtle folded page corner

It must **not** look like Microsoft Office, Word, or a printer icon.

Lockup example:

```text
PAPERSOURCE
Workplace supplies, simply sourced.
```

Default marketing line: *Everything your workplace needs.*  
Corporate campaigns: *Smarter sourcing for modern workplaces.*

Until custom artwork exists, use a restrained typographic wordmark on cream or reversed on navy. Do not use a cartoon pencil as a logo substitute.

---

## 5. Layout and surface language

- Editorial grids. Align to a consistent column system (storefront 12-col; admin data-dense).
- Generous whitespace. Pages should breathe like a well-designed catalogue.
- Paper-like surfaces: cream page, white “sheets,” 1px Soft Grey rules, faint grid where it helps (quotes, invoices, quick order).
- Tabs, labels, and document-index metaphors over floating blobs.
- Corner radius: modest (4–8px). **Do not** use excessive rounded cards or pill-everything.
- Shadows: rare, soft, for drawers/modals only. No neon glow.
- Gradients: **off** unless a future brand exercise explicitly asks.

### Density

| Surface | Density |
| --- | --- |
| Marketing / homepage | Editorial, large type, photography |
| Catalogue | Product imagery dominates. Specs stay crisp. |
| Quote / checkout | Document-like. Clear numbers. |
| Admin | Dense tables, filters, status labels. Still PaperSource, not default shadcn dashboard. |

---

## 6. shadcn/ui + Base UI

Use shadcn for primitives because we **own the source**. New shadcn projects default to Base UI.

**Do not leave the default shadcn appearance.** Recolour and restyle to this document before building pages.

Primitives: button, input, select, dialog, sheet, dropdown, table, tabs, badge, tooltip, form.

Then build PaperSource components on top. Do not ship raw default `Button` as the brand button on the storefront.

---

## 7. Custom components

Required storefront / commerce components:

| Component | Job |
| --- | --- |
| `PaperButton` | Primary navy, secondary outline, ochre accent (rare), ghost |
| `PaperCard` | White sheet on cream, thin border, modest radius |
| `ProductCard` | Procurement card — see §8 |
| `ProductGrid` | Catalogue grid with consistent gaps |
| `ProductQuickView` | Specs + dual CTA without losing context |
| `ProductGallery` | Photography first; no decorative frames |
| `PriceDisplay` | Formats pesewas as `GHS 78.99` / unit |
| `BulkPriceTable` | Per-variant tiers including “Request quote” |
| `QuantitySelector` | Numeric, keyboard-friendly, not only +/- toys |
| `QuoteButton` | Visually distinct from cart CTA |
| `QuoteBasket` | Document-list metaphor, not a mini-cart clone |
| `QuoteSummary` | Totals, status, expiry |
| `CategoryTile` | Photography + label, not a pastel icon tile |
| `BrandLogo` | Quiet, consistent height |
| `DeliveryBadge` | Accra & Tema / Nationwide on request — data-driven |
| `StockBadge` | In stock / low / out |
| `ProcurementCTA` | Business-band button language |
| `CorporateBanner` | Navy band, large type |
| `OfficeBundleCard` | Pack contents as a short list |
| `OrderTimeline` | Fulfilment states |
| `QuoteTimeline` | RFQ state machine |

Admin can reuse tables, filters, and status chips in the same visual language.

---

## 8. Product card — non-negotiable

Forbidden generic card:

```text
[IMAGE]
HP A4 Paper
GHS 79.00
[Add to cart]
```

Required PaperSource card:

```text
Double A Premium A4 Paper
A4 • 80gsm • 500 sheets
GHS 78.00 / ream
10+     GHS 74.50
50+     Request bulk price
✓ In Stock
[ Add to Cart ]
[ Add to Quote ]
```

Must communicate:

- Distinctive product name
- Spec line (size · gsm · pack — or the category equivalent)
- Unit price with **unit** (`/ ream`, `/ box`, `/ pack`)
- At least one bulk hint or “request bulk price”
- Stock
- **Both** CTAs, visually different (navy cart, outline or green-tint quote)

Imagery dominates. Text stays tabular and calm.

---

## 9. Two-cart chrome

Header (and mobile bottom nav) must show **two** objects:

```text
Cart          3
Quote List    8
```

They are visibly different. Do not use two identical basket icons. Cart may use a restrained bag/tray; quote list should feel like a clipboard / document list — not a cartoon.

Drawers:

- Cart drawer: retail lines, subtotal, checkout.
- Quote drawer: procurement lines, quantities, **Request quotation**.

A corporate buyer can add twenty products to a quote without touching the retail cart.

---

## 10. Navigation

### Desktop

Mega menu — not a tiny dropdown.

```text
SHOP
Paper                  Printing
Writing                Filing
Desk                   Technology
Schools                Workplace
```

Also: Brands, Business, Schools, Bulk Orders, Search, Request a Quote, Account, Cart, Quote List.

Universal search placeholder:

> Search paper, toner, pens, brands or SKU...

### Mobile

Design mobile-first for WhatsApp visitors, Instagram referrals, Google search, individual shoppers, and small-business buyers.

Persistent bottom navigation:

```text
Home · Shop · Search · Quote · Cart
```

Quote and Cart both appear. Do not hide quote behind a overflow menu on mobile.

---

## 11. Motion

Use Motion **sparingly**. PaperSource sells trust, not animation.

**Good:** category hover, cart/quote drawers, navigation, image transitions, light scroll reveal, number counters on admin dashboard.

**Bad:** every element flying in, bouncing product cards, giant WebGL, endless parallax, confetti on add-to-cart.

Duration short. Easing quiet. Reduced-motion: honour `prefers-reduced-motion`.

---

## 12. Forms and Ghana addresses

Forms should look like documents: clear labels above fields, Slate help text, Graphite values.

Required address language (not US/CA postal assumptions):

```text
Full Name
Phone Number          ← extremely important
Region
City / Town
Area / Suburb
Street / Landmark
GhanaPost GPS         e.g. GA-123-4567
Delivery Instructions
```

Phone gets the strongest affordance (large, tel input). GPS is mono-spaced.

Delivery area radios on checkout:

```text
○ Accra
○ Tema
○ Other Region
```

Other Region shows copy:

> We'll contact you to confirm the best nationwide delivery option and cost.

Zone labels and fees still come from `delivery_zones` — this is presentation of that rule.

---

## 13. Quote and order documents

Quote and order screens should feel like filed paperwork:

- Quote number prominent (`RFQ-2026-000238`, `PSQ-00219`)
- Status chip (ochre for action needed, green for sent/paid, red for declined)
- Line table with SKU, spec, qty, unit, line total
- Timeline on the side or below
- Upload list as attachments, not chat bubbles

---

## 14. Admin appearance

`/admin` is PaperSource, not “default shadcn dashboard + charts candy.”

- Cream or white workspace, navy sidebar
- Data tables first
- Status chips using the semantic colours
- No purple accent leftovers from the starter
- Same Manrope/Inter pairing

---

## 15. Accessibility

- Contrast: Graphite on cream, white on navy, do not place Slate on ochre for small text
- Focus rings: visible, navy or ochre — never removed
- Dual CTAs: text labels, not icon-only
- Mega menu and drawers: keyboard and escape
- Product images: real alt text (name + key spec)
- See [TESTING.md](TESTING.md) for axe / Lighthouse expectations

---

## 16. Anti-patterns

Never ship:

- Giant floating pencils
- Cartoon notebooks
- Rainbow stationery
- Obvious shopping-cart illustrations as hero art
- Generic blue SaaS gradients
- Default shadcn zinc/purple look on the storefront
- Excessive rounded cards
- Icon-only category grids with no photography
- A single “Add” button that hides the quote path
- “Click WhatsApp to buy” as the primary commercial pattern
- Stock Unsplash of laughing office workers as the brand

---

## 17. Cursor must / must not

**Must**

- Use Paper Cream backgrounds and Ink Navy as primary.
- Use Paper Green sparingly and Golden Ochre for accents only.
- Build procurement-grade product cards with dual CTAs.
- Keep Cart and Quote List visually distinct.
- Treat desktop and mobile as equal work.
- Restyle shadcn before composing pages.

**Must not**

- Produce a generic SaaS or Shopify theme.
- Let green or yellow dominate.
- Use gradients unless explicitly requested.
- Animate everything.
- Hardcode US ZIP-code address forms.
