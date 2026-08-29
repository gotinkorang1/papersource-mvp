---
name: product-catalogue
description: Catalogue, variants, EAV attributes, price tiers, search, and office packs. Use when adding products, categories, brands, or search.
---

# Product catalogue

Read @docs/PRODUCT.md (catalogue) and @docs/DATABASE.md.

## When to Use

- Products, variants, categories, brands, attributes, tiers, search, bundles

## Instructions

1. Shared catalogue feeds both cart and quote. Catalogue must not import cart/quote UI.
2. Variants own SKU, barcode, `unit_label`, `base_unit_price` (pesewas), and `price_tiers`.
3. Tiers are per variant: `minimum_quantity`, `maximum_quantity`, `unit_price` or `request_quote`.
4. Attributes are EAV (`namespace`, `key`, `value_text`). Paper / pens / toner / files as in PRODUCT.md.
5. Office packs are `product_type = bundle` plus bundle item rows.
6. Images: Cloudinary public IDs on `product_images`.
7. Search: name, SKU, barcode, brand, category, aliases via Postgres FTS + `pg_trgm`.
8. Indexable routes: `/shop/[category]`, `/brands/[slug]`, `/product/[slug]`.
9. Product cards and PDPs always expose Add to Cart and Add to Quote.
