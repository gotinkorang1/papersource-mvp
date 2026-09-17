# Whole-Site and Admin Experience Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the public storefront, customer/business journeys, and admin console through shared responsive components and verified workflow upgrades while preserving current commerce and authorization behavior.

**Architecture:** Build on the existing Next.js App Router, Tailwind/shadcn-style primitives, server components, server actions, Supabase/Drizzle data access, and current role checks. Introduce focused shared components and route-level composition changes; keep business rules and mutation authorization on the server.

**Tech Stack:** Next.js 16.3.3, React 19, TypeScript, Tailwind CSS 4, Vitest, Testing Library, Playwright, Supabase/Drizzle.

**Spec:** `docs/superpowers/specs/2026-09-17-whole-site-admin-upgrade-design.md`

## Global Constraints

- Retail cart and quote basket remain separate paths.
- Money remains server-authoritative integer pesewas and VAT-inclusive.
- Existing authentication, staff roles, and permission checks remain authoritative.
- Existing product, brand, category, order, and quote data are not rewritten as part of the UI upgrade.
- Existing URLs and query parameters remain compatible wherever practical.
- Do not add a new design-system dependency solely for visual polish.
- Every phase must leave the application buildable and testable.

---

### Task 1: Establish the shared UI contract and regression baseline

**Files:**
- Inspect: `src/app/globals.css`, `src/components/ui/*`, `src/components/commerce/paper-button.tsx`, `src/components/commerce/paper-card.tsx`
- Modify: only the smallest shared primitive files required after baseline review
- Test: existing product, navigation, account, commerce, and admin component tests

**Interfaces:**
- Consumes: current Tailwind tokens, PaperSource button/card conventions, existing Vitest/Testing Library setup.
- Produces: stable shared states for later phases.

- [ ] **Step 1: Record the baseline checks**

Run:

```powershell
pnpm lint
pnpm test
```

Record current failures before modifying shared UI.

- [ ] **Step 2: Map the shared primitives**

Identify which existing components own buttons, cards, fields, badges, tables, dialogs, loading, empty, and error states. Do not create duplicate primitives.

- [ ] **Step 3: Add focused tests**

Cover pending buttons, invalid fields, status badges, card actions, empty states, keyboard focus, and reduced-motion-safe behavior using existing test conventions.

- [ ] **Step 4: Implement the minimum shared fixes**

Keep variants explicit and preserve accessible labels, focus rings, `aria-disabled`, and pending text.

- [ ] **Step 5: Verify and commit**

```powershell
pnpm test -- src/components/products src/components/navigation src/components/account
git add src/app/globals.css src/components/ui src/components/commerce src/components/admin
git commit -m "refactor: stabilize shared ui states"
```

### Task 2: Upgrade the public site shell and navigation

**Files:**
- Modify: `src/components/navigation/store-shell.tsx`
- Modify: `src/components/navigation/store-header.tsx`
- Modify: `src/components/navigation/store-footer.tsx`
- Modify: `src/components/navigation/mobile-nav.tsx`
- Modify: `src/components/navigation/mobile-menu.tsx`
- Modify: `src/components/navigation/shop-mega-menu.tsx`
- Modify: `src/components/navigation/business-menu.tsx`
- Test: `src/components/navigation/navigation-model.test.tsx`, `shop-menu-model.test.tsx`, `business-menu.test.tsx`

**Interfaces:**
- Consumes: shared UI contract from Task 1 and existing navigation models.
- Produces: concise desktop/mobile navigation with preserved destinations and accessible active states.

- [ ] **Step 1: Add failing navigation regression cases**

Test that store, shop, books, stationery, brand, business, account, cart, and quote destinations appear once, active routes are correct, and mobile navigation closes after selection.

- [ ] **Step 2: Implement grouped navigation presentation**

Keep product discovery separate from business/account actions, preserve the existing shop-menu data source, and avoid duplicating links between desktop and mobile DOM where possible.

- [ ] **Step 3: Verify focus and overlays**

Verify Escape closes open menus, focus returns to the trigger, body scrolling is restored, and skip-to-content remains available.

- [ ] **Step 4: Verify and commit**

```powershell
pnpm test -- src/components/navigation
git add src/components/navigation
git commit -m "improve: streamline public navigation"
```

### Task 3: Complete the storefront discovery experience

**Files:**
- Modify: `src/components/products/product-card.tsx`
- Modify: `src/components/products/product-grid.tsx`
- Modify: `src/components/products/product-grid-list.tsx`
- Modify: `src/components/products/catalogue-toolbar.tsx`
- Modify: `src/components/products/catalogue-pagination.tsx`
- Modify: `src/components/products/product-quick-view.tsx`
- Modify: public shop, category, brand, search, and product route pages
- Test: `src/components/products/product-card.test.tsx`, `product-grid.test.tsx`, and brand-directory tests

**Interfaces:**
- Consumes: shared card/toolbar primitives and current catalogue loaders.
- Produces: one responsive discovery pattern with URL-preserving filters and pagination.

- [ ] **Step 1: Add failing product presentation tests**

Test one product name, one price treatment, no duplicated “/ each” text, correct brand/category context, separate cart/quote actions, keyboard-accessible quick view, and the narrow mobile grid.

- [ ] **Step 2: Add typed URL pagination helpers**

Preserve search, category, brand, availability, and sort parameters while changing only the page. Keep the default page size at 24.

- [ ] **Step 3: Implement card and grid hierarchy**

Use a stable image frame, readable title clamp, compact metadata, one price block, stock/delivery state, and actions usable at narrow widths. Do not render author metadata for non-book products.

- [ ] **Step 4: Apply the same toolbar and pagination to all catalogue routes**

Keep category, brand, and search consistent with shop. Related products reuse the card presentation without catalogue-only controls.

- [ ] **Step 5: Verify and commit**

```powershell
pnpm test -- src/components/products
git add src/components/products src/app
git commit -m "improve: unify storefront product discovery"
```

Review the staged file list before committing so unrelated routes remain unstaged.

### Task 4: Improve cart, quote, checkout, account, and business workflows

**Files:**
- Modify: `src/components/commerce/cart-drawer.tsx`
- Modify: `src/components/quotes/quote-basket.tsx`
- Modify: `src/components/checkout/checkout-form.tsx`
- Modify: `src/components/account/account-nav.tsx`
- Modify: `src/components/account/profile-form.tsx`
- Modify: `src/components/account/address-form.tsx`
- Modify: `src/components/account/organisation-form.tsx`
- Modify: `src/components/quotes/rfq-form.tsx`
- Modify: relevant route pages under `src/app/(checkout)`, `src/app/(account)`, and `src/app/(corporate)`
- Test: existing commerce, quote, checkout, and account tests plus focused tests for changed components

**Interfaces:**
- Consumes: shared form, status, card, and feedback patterns from Tasks 1–3.
- Produces: clearer workflows without changing server mutation contracts.

- [ ] **Step 1: Add dual-path isolation tests**

Verify cart actions never add to the quote basket, quote actions never add to the retail cart, quantities and pesewa prices remain correct, and failed submissions retain entered values.

- [ ] **Step 2: Unify line-item and summary presentation**

Use one quantity control, price display, validation message, and action hierarchy across cart and quote surfaces.

- [ ] **Step 3: Improve forms and account navigation**

Show required fields, field-level errors, pending state, successful save feedback, and recoverable server errors without clearing valid input.

- [ ] **Step 4: Verify and commit**

```powershell
pnpm test -- src/components/commerce src/components/quotes src/components/account src/components/checkout
git add src/components/commerce src/components/quotes src/components/account src/components/checkout
git commit -m "improve: clarify commerce and account workflows"
```

### Task 5: Upgrade the admin shell and dashboard

**Files:**
- Modify: `src/app/admin/(console)/layout.tsx`
- Modify: `src/app/admin/(console)/page.tsx`
- Modify: `src/components/admin/sidebar.tsx`
- Modify: `src/components/admin/nav.ts`
- Modify: `src/components/admin/status-badge.tsx`
- Create or modify focused dashboard summary components under `src/components/admin/`
- Test: focused admin component and route tests

**Interfaces:**
- Consumes: `StaffActor`, `canAccessAdmin`, existing admin loaders, and shared UI primitives.
- Produces: permission-aware navigation and an actionable dashboard without weakening authorization.

- [ ] **Step 1: Add failing admin tests**

Test role-based visibility, active route state, mobile drawer focus behavior, loading/error/empty dashboard states, and summary links.

- [ ] **Step 2: Refine admin navigation grouping**

Group catalogue, commerce operations, customers/organisations, content/taxonomy, and configuration. Keep only links readable by the current actor.

- [ ] **Step 3: Build the attention model**

Present actionable counts for orders, quotes, inventory, catalogue, and recent activity using existing server-authoritative data. Do not invent metrics or add mutations.

- [ ] **Step 4: Add responsive admin shell behavior**

Keep the sidebar usable on desktop and a controlled drawer on mobile. Preserve skip navigation, focus return, Escape handling, and account-panel behavior.

- [ ] **Step 5: Verify and commit**

```powershell
pnpm test -- src/components/admin
git add src/app/admin src/components/admin
git commit -m "improve: modernize admin shell and dashboard"
```

### Task 6: Improve admin catalogue and operations workflows

**Files:**
- Modify: admin products, inventory, orders, quotes, brands, and categories pages under `src/app/admin/(console)`
- Modify: `src/components/admin/new-product-form.tsx`
- Modify: `src/components/admin/product-taxonomy-picker.tsx`
- Modify: `src/components/admin/product-image-manager.tsx`
- Modify: `src/components/admin/saved-product-image-editor.tsx`
- Modify: `src/components/admin/bulk-inventory-submit.tsx`
- Modify: related admin mutation routes only when needed for explicit UI-safe results
- Test: existing admin mutation/component tests plus filters, persistence, upload, and permission tests

**Interfaces:**
- Consumes: admin shell/status patterns from Task 5, existing mutation endpoints, and current RBAC checks.
- Produces: table-first catalogue operations with search, filters, bulk actions, pagination, and explicit save states.

- [ ] **Step 1: Add persistence and permission tests**

Test successful save, validation failure, permission denial, upload failure, retry behavior, and retention of unsaved values after recoverable errors.

- [ ] **Step 2: Add shared admin list controls**

Use consistent search, filters, result counts, page navigation, and empty states for products, brands, categories, inventory, orders, and quotes.

- [ ] **Step 3: Improve product editing and media**

Make brand/category selection, front/back images, ordering, price, quantity, status, and save state explicit without changing image persistence contracts.

- [ ] **Step 4: Improve operational records**

Make order, quote, and inventory status, primary actions, and destructive consequences clear while preserving server-side role checks.

- [ ] **Step 5: Verify and commit**

```powershell
pnpm test -- src/components/admin
pnpm lint
git add src/app/admin src/components/admin
git commit -m "improve: strengthen admin catalogue operations"
```

### Task 7: Responsive, accessibility, and production verification

**Files:**
- Modify: only focused files identified by verification failures
- Test: `playwright.config.ts`, existing e2e tests, and new smoke coverage in the repository’s established test location

**Interfaces:**
- Consumes: all completed public and admin phases.
- Produces: release evidence and an explicit list of resolved or carried-forward issues.

- [ ] **Step 1: Run authoritative static checks**

```powershell
pnpm lint
pnpm test
pnpm build
```

Fix failures before making release claims.

- [ ] **Step 2: Run responsive browser smoke checks**

Exercise homepage, shop, category, brand, search, product, cart, quote, checkout, account, and admin dashboard at approximately 375px, 768px, and 1440px widths.

- [ ] **Step 3: Run permission and mutation smoke checks**

Verify staff role restrictions, product save, inventory update, order/quote actions, customer/account save, and failed-mutation feedback.

- [ ] **Step 4: Check for UI regressions**

Search rendered routes and source for duplicated product names, duplicated price suffixes, missing labels, console errors, broken focus behavior, and incorrect links.

- [ ] **Step 5: Review the final diff**

```powershell
git diff --check
git status --short
git log -5 --oneline
```

Commit only intended implementation and test files, and report unrelated dirty-worktree files without staging them.

