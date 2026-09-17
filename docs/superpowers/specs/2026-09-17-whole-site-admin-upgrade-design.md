# Whole-Site and Admin Experience Upgrade

## Status

Design proposal for review. No application behavior is changed by this document.

## Goal

Improve PaperSource as a complete stationery-commerce experience across the public storefront, customer and business journeys, and the staff administration console. The upgrade should make the site easier to understand, faster to use, more consistent across screen sizes, and safer to operate without changing the business meaning of the existing retail-cart and quote-basket flows.

The work will improve shared foundations and workflows rather than applying unrelated page-specific styling patches.

## Scope and boundaries

### Included

- Shared visual foundations: typography, spacing, color usage, buttons, cards, forms, tables, badges, alerts, loading states, empty states, and error states.
- Public storefront: home, shop, category, brand, search, product detail, related products, cart, quote basket, checkout, delivery, orders, and supporting content pages.
- Account and business areas: authentication, profiles, addresses, orders, organisations, bulk orders, schools, corporate accounts, and quote flows.
- Admin console: dashboard, navigation, products, inventory, orders, quotes, customers, organisations, brands, categories, navigation, pages, reviews, deliveries, pricing, payments, logs, users, and settings.
- Responsive and accessibility improvements for mobile, tablet, and desktop layouts.
- Reliable user feedback for saving, loading, validation, success, failure, and permission-denied states.
- Verification of the main retail, quote, account, and staff workflows.

### Explicitly preserved

- Retail cart and quote basket remain separate paths.
- Money remains server-authoritative integer pesewas and VAT-inclusive.
- Existing authentication, staff roles, and permission checks remain authoritative.
- Existing product, brand, category, order, and quote data are not rewritten as part of the UI upgrade unless a separately identified data defect requires it.
- Existing URLs and query parameters remain compatible wherever practical.

### Excluded unless separately approved

- Replacing the application framework or database.
- Introducing a new design system dependency solely for visual polish.
- Changing payment, tax, inventory, or quote business rules.
- Bulk catalogue enrichment or deletion unrelated to a confirmed defect.

## Product experience design

### Shared foundation

Create a small set of reusable primitives and composition patterns for repeated UI behavior. Components should expose semantic states instead of forcing every route to recreate visual rules. The foundation will cover:

- consistent heading and body hierarchy;
- responsive containers and section spacing;
- primary, secondary, quiet, destructive, and loading button states;
- product, summary, status, and empty-state cards;
- form fields with labels, help text, validation, and disabled/pending states;
- tables with responsive overflow or compact mobile alternatives;
- accessible focus rings, keyboard behavior, reduced-motion support, and live-region feedback.

The existing visual language will be refined rather than replaced, so the stationery-shop identity remains recognizable.

### Storefront and discovery

Public browsing will use a consistent result header, filter/sort controls, product-card hierarchy, responsive grid, pagination, and empty state across shop, category, brand, and search routes. Product cards will show one clear product name, one price treatment, brand/category context where useful, stock state, and distinct retail and quote actions without duplicated labels.

The approved 24-item default page size will remain the baseline for large result sets, with URL-driven pagination that preserves active search, category, brand, availability, and sort parameters.

Product detail pages will prioritize image, title, price, availability, purchase actions, description, specifications, delivery information, and related products in a clear order. Books may show authors; stationery and other products must not display fabricated author fields.

### Cart, quote, checkout, and account flows

The two purchase intents will remain visually distinct but share consistent line-item, quantity, price, validation, and feedback patterns. Forms will show progress and recoverable errors without losing entered data. Order and quote status pages will make the next customer action obvious.

### Admin experience

The admin console will become an operations workspace rather than a collection of isolated forms.

- The dashboard will surface actionable summaries: orders requiring attention, open quotes, low/out-of-stock inventory, recent activity, and relevant catalogue counts.
- Navigation will be grouped by workflow, with clear active state, permission-aware visibility, mobile drawer behavior, and a consistent account/control area.
- Product, inventory, order, quote, customer, brand, category, and review areas will use table-first layouts with search, explicit filters, result counts, pagination, and appropriate bulk actions.
- Edit screens will use stable sections, clear required fields, visible unsaved/pending/saved states, and sticky action areas where helpful.
- Destructive actions will use explicit confirmation and explain the consequence. Permission failures will be visible and non-destructive.
- Mobile admin views will support horizontal table scrolling or compact record cards without hiding critical actions.

## Data flow and interaction rules

- Server components and server actions remain the source of truth for protected data and mutations.
- Client components are used for local interaction such as menus, filters, dialogs, quantity controls, and optimistic visual feedback, but cannot authorize mutations.
- Query-string state is used for shareable public catalogue filters and pagination.
- Admin mutation responses must provide a clear success or failure result, retain validation context, and avoid silently discarding user input.
- Loading and error boundaries will be added or improved at route-group boundaries where they materially improve recovery.
- Analytics or logging changes are out of scope unless needed to diagnose a confirmed production issue.

## Phased delivery

1. **Foundation and shells**: shared primitives, public shell, admin shell, navigation, focus/loading/error states.
2. **Storefront discovery**: product cards, grids, result toolbar, pagination, shop/category/brand/search/product routes.
3. **Commerce and customer flows**: cart, quote, checkout, order, account, business, and delivery experiences.
4. **Admin operations**: dashboard, catalogue, inventory, orders, quotes, customers, taxonomy, content, settings, and responsive tables.
5. **Hardening and release**: accessibility, responsive browser checks, regression tests, build verification, and production readiness review.

Each phase should leave the application buildable and should be reviewed before the next phase begins when the change affects permissions, data mutations, or checkout behavior.

## Verification strategy

- Run the repository's authoritative typecheck, lint, unit, and build checks.
- Add or update focused tests for shared components and high-risk interaction rules.
- Exercise public flows at approximately 375px, 768px, and 1440px widths.
- Exercise admin read and write flows with permission-aware states.
- Verify retail cart and quote basket remain independent.
- Verify product price, stock, brand, category, and action labels render once and remain consistent across cards and detail pages.
- Verify no unrelated catalogue or production data is modified.
- Review the final diff and deployment metadata before claiming completion.

## Success criteria

- Users can find, understand, and act on products without duplicated or conflicting UI.
- The same interaction patterns work across public pages and screen sizes.
- Staff can reach important operations quickly and understand what needs attention.
- Mutations clearly communicate pending, success, validation, permission, and failure states.
- Existing commerce, quote, authentication, role, pricing, and inventory behavior remains correct.
- The implementation is covered by focused automated checks and responsive browser verification.
