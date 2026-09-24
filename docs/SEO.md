# PaperSource — SEO

**Status:** Phase 0. Must not contradict [PRODUCT.md](PRODUCT.md).  
**Purpose:** Indexable catalogue, Ghana queries, metadata, Product JSON-LD.  
Implementation sits in the App Router (`generateMetadata`, JSON-LD script tags).

---

## 1. Target searches

PaperSource should earn these (and close variants):

```text
office stationery Ghana
stationery suppliers Accra
office supplies Accra
A4 paper Ghana
printer toner Ghana
bulk stationery Ghana
school stationery supplier Ghana
office supplies Tema
corporate stationery Ghana
```

Also: brand + product (`HP 305`, `Double A A4`, `Canon toner Ghana`).

Do not manufacture dozens of thin doorway pages that repeat the same paragraph. Each indexable URL needs unique catalogue or editorial substance.

---

## 2. Indexable route patterns

| Pattern | Why |
| --- | --- |
| `/` | Brand + Accra/Tema + dual path |
| `/shop` | Full catalogue |
| `/shop/[category]` | e.g. `/shop/paper`, `/shop/writing`, `/shop/printer-supplies`, `/shop/files-folders` |
| `/product/[slug]` | Unique product content + offers |
| `/brands` | Brand index |
| `/brands/[slug]` | `/brands/hp`, `/brands/canon`, `/brands/double-a` |
| `/search` | `noindex` (search result pages) unless a later policy says otherwise |
| `/business`, `/schools`, `/bulk-orders`, `/delivery` | Intent pages with real copy |
| `/cart`, `/checkout`, `/quote`, `/account`, `/admin`, `/quick-order` | `noindex` |

Canonical host: `https://www.papersourcegh.com`. The apex domain redirects to
this host, so sitemaps, canonicals, structured data, feeds, and share URLs
must publish the `www` URL directly.

---

## 3. Per-URL metadata

Every public indexable page:

| Tag | Rule |
| --- | --- |
| `title` | Specific, Ghana-relevant where natural. Not “Home \| Company”. |
| `description` | Unique. Mention Accra/Tema or procurement when true. |
| `canonical` | Absolute URL, one per product/category |
| Open Graph | title, description, image (Cloudinary), `og:type` product on PDP |
| Twitter card | summary_large_image on PDP / home |
| robots | index/follow on catalogue; noindex on account, checkout, quote basket, admin |

### Product pages (required)

- Canonical
- Open Graph
- Product **JSON-LD**
- Breadcrumbs (UI + `BreadcrumbList` JSON-LD)
- Availability
- Brand
- SKU
- Images
- Offer (price in GHS, inclusive; `priceCurrency: GHS`)
- Shipping rich-result data only when one accurate rate and delivery window can
  be expressed for the destination. Keep Accra/Tema zone pricing and
  nationwide-on-request terms out of product schema until they are configured
  accurately in Merchant Center.

This matters for Google search / later Merchant visibility.

---

## 4. Product JSON-LD (shape)

Emit `Product` with `Offer` (or `AggregateOffer` if variants differ). Amounts in major units for schema.org (`78.99`) **derived from pesewas** in the serializer — do not store floats in the DB.

Include:

- `name`, `description`, `sku`, `image[]`
- `brand` (`Brand`)
- `offers.price`, `offers.priceCurrency`, `offers.availability` (InStock / OutOfStock / PreOrder)
- `offers.url` canonical PDP
- Optional: `additionalProperty` for GSM, size, yield

If the only way to buy at that qty is Request Quote, do not invent a fake low price in JSON-LD. Use the list/base inclusive price or omit a misleading offer — prefer honest `Offer` at the 1-unit VAT-inclusive list price.

---

## 5. Category and brand pages

- H1 = category/brand name
- Short unique intro (CMS or seeded copy)
- Filters do **not** each need a new indexable URL in MVP (use query params + `canonical` back to the clean category URL)
- Pagination: rel next/prev or `canonical` to page 1 — pick one consistent approach

---

## 6. Technical

- `sitemap.ts` / `robots.ts` in App Router: include shop, products, brands, marketing; exclude admin, account, checkout, tokens
- Structured data valid (test with Rich Results)
- Images: real `alt` (name + key spec); Cloudinary responsive
- Performance supports SEO: see later performance skill; no blocking hero video
- 404 for unknown slugs (not empty 200)
- Locale: content in English (Ghana). `og:locale` `en_GH` if supported

---

## 7. Copy constraints

- Delivery sentence must stay true: Accra & Tema direct; nationwide on request.
- Do not claim “nationwide free delivery” unless zones say so.
- Dual path may appear in business landing SEO (“bulk quote”, “procurement”) without keyword stuffing.

---

## 8. Cursor must / must not

**Must**

- Create indexable `/shop/[category]` and `/brands/[slug]`.
- Generate canonical, OG, breadcrumbs, and Product JSON-LD on every PDP.
- Keep checkout, account, admin, and tokenised quote URLs noindex.
- Derive schema prices from pesewas.

**Must not**

- Ship PDPs without JSON-LD.
- Index guest quote tokens or Paystack return URLs.
- Index transactional helpers such as the SKU quick-order tool; keep them usable, but exclude them from the sitemap and search indexes.
- Create doorway pages for every keyword with duplicate text.
- Put US-only schema (`priceCurrency: USD`) on Ghana offers.
