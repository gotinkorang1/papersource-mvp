---
name: seo-accessibility
description: Ghana SEO, Product JSON-LD, and accessibility. Use when adding public pages, metadata, or interactive UI.
---

# SEO and accessibility

Read @docs/SEO.md and the accessibility rule.

## When to Use

- Public routes, metadata, JSON-LD, forms, nav, images

## Instructions

1. Index `/`, `/shop`, `/shop/[category]`, `/product/[slug]`, `/brands`, `/brands/[slug]`, and real marketing pages.
2. `noindex` cart, checkout, account, admin, tokenised quotes, Paystack return URLs.
3. Every PDP: canonical, Open Graph, breadcrumbs, Product JSON-LD (offer, availability, brand, SKU, images). `priceCurrency: GHS`. Derive schema prices from pesewas.
4. Do not invent a fake offer price for request-quote-only quantities.
5. No thin doorway pages. Category filters stay query params with canonical to the clean URL (MVP).
6. Focus rings visible. Text labels on CTAs. Keyboard drawers/menus. Real image alt (name + spec).
7. Contrast: Graphite on cream; white on navy. Honour reduced motion.
