# PaperSource storefront UI refresh

**Status:** Approved design

## Intent

Make the customer-facing site feel more polished and consistent on desktop and mobile without changing commerce behavior, routes, pricing, authentication, or the dual cart/quote model.

## Direction

- Preserve the PaperSource cream, navy, restrained green/ochre palette and Manrope/Inter pairing.
- Improve the shared header, mobile navigation, footer, page rhythm, cards, forms, loading/empty/error states, dark mode, focus states, and reduced-motion behavior.
- Keep mobile touch-friendly, avoid horizontal overflow, and preserve distinct Cart and Quote List paths.

## Validation

Run lint, TypeScript, unit tests, production build, and desktop/mobile route smoke checks for home, shop, category, product, cart, checkout, account, and admin entry pages. Do not stage unrelated catalogue/assets.

## Out of scope

No payment, authentication, database, pricing, inventory, delivery, SEO logic, UI framework, or bulk catalogue changes.
