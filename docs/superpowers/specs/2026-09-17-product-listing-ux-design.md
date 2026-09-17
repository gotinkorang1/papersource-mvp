# Product Listing UX Upgrade

## Goal

Make PaperSource product discovery feel calm, useful, and consistent across the main shop, category listings, brand listings, search results, and related products while preserving the dual retail-cart and quote-basket paths.

## Decisions

- Use a shared page size of 24 products for server-rendered listing pages.
- Keep the existing responsive grid rhythm: one column only on very narrow screens, two on mobile, three at medium widths, and four on large screens.
- Reuse one pagination model and URL contract across shop, category, brand, and search listings. Existing query, category, brand, availability, zone, and sort parameters must survive page changes.
- Keep filters and sorting in the URL so results are shareable, refresh-safe, and crawlable.
- Keep Cart and Quote as separate primary actions. Do not merge them into one interaction.
- Improve the shared card rather than applying route-specific styling patches.

## Experience changes

### Listing shell

The shop page remains the canonical listing shell. Its results header will show the result count, visible range, current sort, and active filters without duplicating the same count in multiple places. Category and brand pages will use the same result shell and pagination behavior, while retaining their descriptive header content.

### Toolbar

Search and sorting stay immediately discoverable. Secondary filters remain collapsible, with a compact mobile presentation, active-filter chips, and a clear-all action. Controls retain keyboard-visible focus styles and explicit accessible labels.

### Product card

Cards will use a stable visual hierarchy: image and stock state, product name/specification, price, delivery signal, quantity, and the two purchase paths. Repeated or low-priority metadata will be visually reduced without removing essential accessible text. Touch targets remain at least 44px high, and image sizing will use responsive `sizes` values and stable aspect ratios.

### Pagination

Pagination will expose the current range and page position, provide clear previous/next actions, preserve all active query parameters, and avoid rendering when there is only one page. The same component will be usable by shop, category, brand, and search routes.

### Related products

Product detail recommendations will use the shared card/grid treatment and stay visually subordinate to the primary product purchase area.

## Accessibility and performance

- Preserve semantic headings, landmarks, labels, live result updates, and keyboard focus states.
- Avoid client-side fetching for the core listing; keep filtering, sorting, and pagination server-rendered.
- Keep card animations subtle and disabled when reduced motion is requested.
- Keep image priority limited to the first visible product.

## Verification

- Unit tests cover page-size math, pagination URL preservation, empty and single-page states, and card accessibility labels.
- Typecheck, lint, and the relevant component tests must pass.
- Verify shop, category, brand, search, and product-detail related-product rendering at narrow mobile and desktop widths.

