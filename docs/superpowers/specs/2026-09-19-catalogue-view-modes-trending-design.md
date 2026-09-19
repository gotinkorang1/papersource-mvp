# Catalogue view modes, freshness badges, and trending products

## Outcome

Give customers and staff a consistent, responsive way to browse products while preserving the admin dashboard's table-first workflow. Product freshness and popularity must be data-backed, accessible, and safe to expose publicly.

## Scope

### Customer catalogue

- Add a view-mode control to shop, category, brand, and search product listings.
- Support four modes:
  - **Default**: the current responsive product-card grid.
  - **Grid**: denser product cards for scanning more items.
  - **List**: horizontal rows with image, product identity, stock, price, and actions.
  - **Content**: editorial rows with a larger image, description/specification copy, and clear actions.
- Persist the selected mode per device using a namespaced local-storage key. Accept a URL `view` override so shared links can open in a requested mode.
- Keep the current URL filters, pagination, cart/quote actions, quick view, and admin edit links intact.

### Admin catalogue

- Add the same view-mode control above `/admin/products`.
- Keep **Default** as the table-first management view with selection, bulk actions, search, sorting, pagination, and edit links.
- Make Grid, List, and Content views read-only presentation modes with prominent edit actions and the same status/image metadata.
- Ensure mobile layouts never require horizontal scrolling for the presentation modes; the default table may retain an intentional compact overflow treatment for dense management data.

### New-product badge

- Expose `products.createdAt` through the catalogue card and admin row models.
- Mark a product `New` when its creation time is within the previous seven calendar days, using the server clock.
- Do not mark products based on `updatedAt`; editing an older product must not make it appear new.
- Render the badge with text and color, never color alone. It must remain legible in light and dark mode.

### Trending signal

- Add a server-side `product_view_events` table containing product ID, a privacy-safe anonymous session fingerprint, and event timestamp.
- Record a product-open event when a product detail page is successfully viewed. Do not record failed/not-found pages, admin previews, or personally identifying data.
- Deduplicate the same fingerprint/product within a 24-hour period and enforce a short server-side rate limit.
- Rank products using unique daily opens over a rolling 30-day window. A product is `Trending` when it is in the configured top result set for the current catalogue query; avoid showing a misleading badge when there is insufficient data.
- Keep the event write non-blocking for page rendering. If analytics storage is unavailable, the product page and catalogue remain fully usable.
- Expose only aggregated counts/ranks to staff and a boolean badge to customers.

## Data and API boundaries

- Extend `ProductCardModel` with `createdAt`, `isNew`, and optional `isTrending`/`viewCount` fields. Keep date calculations server-side.
- Extend admin product rows with the fields needed by the presentation views without weakening staff authorization.
- Add a narrow internal event mutation/route protected against cross-site abuse; it must validate a real product ID and never accept an arbitrary count.
- Add the migration and RLS policies for `product_view_events`. Public browsing may create a deduplicated event only through the server boundary; clients cannot read raw events.
- Keep money, stock, cart, and quote behavior unchanged.

## UX and accessibility

- Use a labeled segmented control with `aria-pressed`, visible focus rings, and tooltips or text labels that remain understandable on small screens.
- Preserve the user's selected mode across navigation and refresh without causing a full page reload.
- Use responsive breakpoints rather than fixed card widths. List and Content modes collapse to stacked cards on narrow screens.
- Add `New` and `Trending` badges near product identity, with stable layout space to avoid content shifting.
- Respect `prefers-reduced-motion`; view changes and badge transitions must remain functional without animation.
- Keep touch targets at least 44px and maintain readable contrast in both themes.

## Testing and acceptance criteria

- Unit tests cover the seven-day freshness boundary, future/invalid timestamps, rolling trending thresholds, and deduplication behavior.
- Component tests cover all four modes, active-state semantics, persistence, URL overrides, empty states, dark mode, keyboard navigation, and reduced motion.
- Admin tests confirm table selection/bulk actions remain intact in Default mode and edit links are present in every presentation mode.
- Desktop and mobile Playwright smoke tests cover shop, category, search, admin products, mode switching, product opening, and return navigation.
- Build, typecheck, targeted tests, and the production route smoke suite must pass before deployment.
- Search, cart, quote, and product detail URLs remain crawlable and canonical in every mode.

## Rollout and safeguards

- Ship the view modes and freshness badge first behind no feature flag because they are deterministic and presentation-only.
- Enable trending display only after the event migration and aggregate query are verified in production; fall back to hiding the badge when data is insufficient.
- Monitor event insert failures and query latency without capturing customer identity or raw browsing history beyond the minimum deduplication fingerprint and timestamp.
