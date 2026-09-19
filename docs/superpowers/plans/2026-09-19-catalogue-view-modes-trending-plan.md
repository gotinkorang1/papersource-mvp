# Catalogue view modes, freshness badges, and trending products Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add professional customer/admin catalogue view modes, accurate seven-day New badges, and privacy-safe product trending signals without changing cart, quote, price, or authorization behavior.

**Architecture:** Keep a shared server-rendered `ProductCardModel` enriched with `createdAt`, `isNew`, and optional trend metadata. A small client-side view controller persists the selected presentation mode while the server continues to own catalogue filtering and pagination. Record deduplicated product opens through a server boundary backed by a private `product_view_events` table; catalogue queries consume only aggregated trend counts.

**Tech Stack:** Next.js 16 App Router, React, TypeScript, Tailwind CSS, Drizzle/Postgres migrations, Supabase RLS, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-19-catalogue-view-modes-trending-design.md`

## Global Constraints

- Preserve the dual retail-cart and quote-basket paths.
- Keep money in integer pesewas and prices server-authoritative.
- Product freshness uses `products.createdAt`, never `updatedAt`.
- Raw view events are never readable by public clients; only aggregated trend data is exposed.
- Failed/not-found pages, admin previews, and personally identifying data must not create view events.
- All controls must support keyboard focus, dark mode, reduced motion, and touch targets of at least 44px.
- Do not weaken existing staff RBAC, catalogue filters, pagination, or bulk actions.

## Review Focus

- A product exactly seven calendar days old must not be marked New; a product one second inside the window must be marked New. Test this at the UTC boundary.
- A future or invalid `createdAt` must never produce a New badge. Test both malformed and clock-skewed inputs.
- Repeated opens from the same anonymous session on the same day must create at most one event. Test deduplication and rate limiting.
- A product detail 404 or admin preview must not increment trend counts. Test both server paths.
- Switching view modes must preserve query filters, pagination, cart/quote actions, and edit links. Test desktop and mobile navigation.

---

### Task 1: Add product view-event storage and privacy-safe aggregation

**Files:**
- Create: `drizzle/0019_product_view_events.sql`
- Modify: `src/lib/db/schema/catalogue.ts`
- Create: `src/features/catalogue/trending.ts`
- Test: `src/features/catalogue/trending.test.ts`

**Interfaces:**
- Produces `recordProductOpen(input: { productId: string; fingerprint: string; occurredAt?: Date }): Promise<boolean>`.
- Produces `listTrendingProductIds(productIds: string[], now?: Date): Promise<Map<string, number>>`.
- Consumes existing `products` IDs and the project’s Drizzle client/RLS migration conventions.

- [ ] **Step 1: Write failing aggregation and deduplication tests**

  Cover a rolling 30-day window, one event per fingerprint/product/day, exclusion of older events, and an empty result when no IDs are supplied. Use an injectable database/test adapter so tests do not require hosted Supabase.

- [ ] **Step 2: Add the migration**

  Create `product_view_events` with UUID primary key, `product_id` foreign key, `fingerprint` text, `occurred_at` timestamptz, a unique index on `(product_id, fingerprint, date_trunc('day', occurred_at))` implemented with a generated day column if needed by Postgres, and indexes on `(product_id, occurred_at)`. Enable RLS with no public select policy; server-side writes must use the existing trusted database boundary.

- [ ] **Step 3: Add the Drizzle table definition and aggregation helpers**

  Add the table to `src/lib/db/schema/catalogue.ts`. Implement `recordProductOpen` with `on conflict do nothing`, a 24-hour freshness check, and a bounded fingerprint length. Implement `listTrendingProductIds` with a parameterized 30-day `count(*)`, returning counts keyed by product ID.

- [ ] **Step 4: Run the focused tests**

  Run `pnpm exec vitest run src/features/catalogue/trending.test.ts --pool=threads --maxWorkers=1`.

- [ ] **Step 5: Commit the storage unit**

  ```bash
  git add drizzle/0019_product_view_events.sql src/lib/db/schema/catalogue.ts src/features/catalogue/trending.ts src/features/catalogue/trending.test.ts
  git commit -m "Add privacy-safe product view analytics"
  ```

### Task 2: Add shared freshness and presentation metadata

**Files:**
- Modify: `src/types/catalogue.ts`
- Create: `src/features/catalogue/presentation.ts`
- Test: `src/features/catalogue/presentation.test.ts`
- Modify: `src/features/catalogue/db-queries.ts`
- Modify: `src/features/catalogue/admin.ts`

**Interfaces:**
- Produces `isProductNew(createdAt: Date | string | null | undefined, now?: Date): boolean`.
- Produces `decorateProductPresentation(product, options): ProductCardModel` with `isNew`, optional `isTrending`, and `viewCount`.
- Extends `ProductCardModel` and admin rows with `createdAt`, `isNew`, optional `isTrending`, and optional `viewCount`.

- [ ] **Step 1: Write freshness boundary tests**

  Test dates at 6 days 23:59:59, exactly 7 days, 7 days plus one second, future dates, invalid strings, and null values.

- [ ] **Step 2: Implement the pure presentation helpers**

  Use UTC millisecond comparisons against a supplied `now`. Return false for missing/invalid/future values and true only when `0 <= now - createdAt < 7 days`.

- [ ] **Step 3: Extend catalogue queries**

  Select `products.createdAt` in `loadActiveProducts` and admin product rows. Add trend counts only after the base query has produced the current page, so filtering/pagination remains unchanged. Map the server-owned metadata into product card models.

- [ ] **Step 4: Run tests and typecheck**

  Run `pnpm exec vitest run src/features/catalogue/presentation.test.ts src/features/catalogue/trending.test.ts --pool=threads --maxWorkers=1` and `pnpm exec tsc --noEmit --pretty false`.

- [ ] **Step 5: Commit the model unit**

  ```bash
  git add src/types/catalogue.ts src/features/catalogue/presentation.ts src/features/catalogue/presentation.test.ts src/features/catalogue/db-queries.ts src/features/catalogue/admin.ts
  git commit -m "Add catalogue freshness and trend metadata"
  ```

### Task 3: Build the shared view-mode controller and renderers

**Files:**
- Create: `src/components/products/catalogue-view-mode.tsx`
- Create: `src/components/products/product-list.tsx`
- Create: `src/components/products/product-content-list.tsx`
- Modify: `src/components/products/product-grid-list.tsx`
- Modify: `src/components/products/product-card.tsx`
- Test: `src/components/products/catalogue-view-mode.test.tsx`

**Interfaces:**
- `CatalogueViewMode = "default" | "grid" | "list" | "content"`.
- `CatalogueViewModeControl({ value, onChange, compact? })` renders labeled buttons with `aria-pressed`.
- `ProductGridList({ products, canEdit, viewMode, onViewModeChange })` renders all four modes while preserving existing add-to-cart, add-to-quote, quick-view, and edit callbacks.

- [ ] **Step 1: Write component tests**

  Test all four render modes, active button semantics, local-storage persistence with a namespaced key, URL override precedence, keyboard activation, empty products, dark-mode classes, and reduced-motion-safe classes.

- [ ] **Step 2: Implement the control**

  Use real buttons, lucide icons plus visible text, a mobile overflow-safe layout, `aria-label="Catalogue display"`, `aria-pressed`, focus-visible rings, and `motion-safe` only for optional transitions. Validate unknown URL/local-storage values back to `default`.

- [ ] **Step 3: Implement list and content renderers**

  Reuse `ProductCard` action logic. List mode uses a horizontal row on larger screens and stacked cards below `sm`; Content mode adds description/spec copy without making database requests from the client. Keep every action at a 44px minimum target.

- [ ] **Step 4: Add badges to the shared card identity area**

  Render text badges for `New` and `Trending` with stable reserved space, readable contrast, and no color-only meaning. Do not show Trending when `isTrending` is false or undefined.

- [ ] **Step 5: Run component tests**

  Run `pnpm exec vitest run src/components/products/catalogue-view-mode.test.tsx --pool=threads --maxWorkers=1`.

- [ ] **Step 6: Commit the shared presentation unit**

  ```bash
  git add src/components/products/catalogue-view-mode.tsx src/components/products/product-list.tsx src/components/products/product-content-list.tsx src/components/products/product-grid-list.tsx src/components/products/product-card.tsx src/components/products/catalogue-view-mode.test.tsx
  git commit -m "Add responsive catalogue view modes"
  ```

### Task 4: Integrate customer catalogue pages

**Files:**
- Modify: `src/app/(store)/shop/page.tsx`
- Modify: `src/app/(store)/shop/[category]/page.tsx`
- Modify: `src/app/(store)/brands/[slug]/page.tsx`
- Modify: `src/app/(store)/search/page.tsx`
- Modify: `src/app/(store)/product/[slug]/page.tsx`
- Create: `src/app/api/catalogue/view/route.ts`
- Test: `e2e/catalogue-view-modes.spec.ts`

**Interfaces:**
- Product pages call the internal view event route only after a valid product has loaded.
- Listing pages pass the validated `view` query value and the server-enriched product models into `ProductGridList`.

- [ ] **Step 1: Add the event route test contract**

  Verify malformed IDs, missing fingerprints, overlong fingerprints, and not-found product IDs are rejected; valid events return an idempotent success response without exposing raw event data.

- [ ] **Step 2: Implement the event route**

  Derive a short-lived anonymous fingerprint from an existing non-sensitive session cookie or a server-generated cookie; do not accept email, profile ID, IP, or arbitrary counts. Call `recordProductOpen` and return `{ ok: true }` even when deduplication makes it a no-op. Add `Cache-Control: no-store`.

- [ ] **Step 3: Wire product detail opens**

  Add a tiny client beacon component or server-triggered mutation only after `getProductBySlug` succeeds. Exclude staff/admin preview contexts and avoid blocking product rendering.

- [ ] **Step 4: Add mode controls to all customer listings**

  Preserve existing filters and pagination links. Pass the view mode through pagination links and keep local persistence as the fallback. Ensure no full-page reload is required for a mode switch when JavaScript is available.

- [ ] **Step 5: Run Playwright customer coverage**

  Run `pnpm exec playwright test e2e/catalogue-view-modes.spec.ts --project=chromium --project=mobile` and verify shop, category, brand, search, product open, cart/quote actions, badges, and return navigation.

- [ ] **Step 6: Commit customer integration**

  ```bash
  git add src/app/(store)/shop/page.tsx src/app/(store)/shop/[category]/page.tsx src/app/(store)/brands/[slug]/page.tsx src/app/(store)/search/page.tsx src/app/(store)/product/[slug]/page.tsx src/app/api/catalogue/view/route.ts e2e/catalogue-view-modes.spec.ts
  git commit -m "Integrate catalogue modes and product view tracking"
  ```

### Task 5: Integrate admin product presentation modes

**Files:**
- Modify: `src/app/admin/(console)/products/page.tsx`
- Create: `src/components/admin/admin-product-presentations.tsx`
- Test: `src/components/admin/admin-product-presentations.test.tsx`
- Modify: `src/features/catalogue/admin.ts`

**Interfaces:**
- Default mode keeps the existing `<form>` table structure, Select All behavior, bulk status actions, search, sort, and pagination unchanged.
- Presentation modes receive the same page rows and `canWrite` capability and render edit links to `/admin/products/:id`.

- [ ] **Step 1: Write admin mode tests**

  Assert Default mode includes selection/bulk controls, Grid/List/Content include edit links, read-only staff never receives write controls, and all modes show status, category, brand, image count, New, and Trending metadata.

- [ ] **Step 2: Extend admin row data**

  Add `createdAt`, image count/preview metadata, and trend count to `listAdminProducts` without changing existing filter semantics or authorization checks.

- [ ] **Step 3: Implement the admin presentation wrapper**

  Keep the current server form for Default mode. Render the other modes outside that form, using the shared mode control and compact edit-focused cards. Keep the filter form above all modes and carry its query parameters into pagination.

- [ ] **Step 4: Verify admin behavior**

  Run `pnpm exec vitest run src/components/admin/admin-product-presentations.test.tsx src/features/catalogue/admin-pagination.test.ts --pool=threads --maxWorkers=1` and the authenticated admin Playwright journey for desktop/mobile.

- [ ] **Step 5: Commit admin integration**

  ```bash
  git add src/app/admin/(console)/products/page.tsx src/components/admin/admin-product-presentations.tsx src/components/admin/admin-product-presentations.test.tsx src/features/catalogue/admin.ts
  git commit -m "Add admin catalogue presentation modes"
  ```

### Task 6: End-to-end verification and release checks

**Files:**
- Modify: `docs/PRODUCT.md` only if the final behavior needs product documentation.
- Modify: `docs/SEO.md` only if the new public badge/view behavior changes crawl guidance.

- [ ] **Step 1: Run focused unit/component suites**

  ```bash
  pnpm exec vitest run src/features/catalogue/presentation.test.ts src/features/catalogue/trending.test.ts src/components/products/catalogue-view-mode.test.tsx src/components/admin/admin-product-presentations.test.tsx --pool=threads --maxWorkers=1
  ```

- [ ] **Step 2: Run typecheck and production build**

  ```bash
  pnpm exec tsc --noEmit --pretty false
  pnpm run build
  ```

- [ ] **Step 3: Run desktop/mobile smoke tests**

  Verify customer shop/search/category/brand modes, product-open tracking, New/Trending badges, admin default table bulk actions, admin presentation modes, dark mode, reduced motion, and mobile touch targets.

- [ ] **Step 4: Verify migration and RLS in a safe database environment**

  Apply `drizzle/0019_product_view_events.sql`, verify the table/indexes/policies, insert a valid deduplicated event through the server route, and confirm direct public reads fail.

- [ ] **Step 5: Review the final diff and commit release notes**

  Confirm no raw event data, customer identity, credentials, or generated assets were added. Record the migration, test commands, and any required Search Console/Vercel follow-up.

## Self-review checklist

- All spec sections map to Tasks 1–6.
- Freshness and trending inputs have explicit boundary tests.
- Admin authorization and bulk workflows remain covered.
- Product page tracking is non-blocking and excludes invalid/admin views.
- The plan introduces no new runtime dependency; it follows existing Drizzle, RLS, Vitest, and Playwright patterns.
