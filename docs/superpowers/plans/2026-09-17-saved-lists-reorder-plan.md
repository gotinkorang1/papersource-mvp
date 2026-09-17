# Saved Lists and Reorder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox ( - [ ] ) syntax for tracking.

**Goal:** Add authenticated saved product lists and safe reorder workflows for retail customers and organisations without changing cart, quote, pricing, or permission semantics.

**Architecture:** Add isolated Drizzle schema tables and repository functions with server-side scope checks. Build account and product UI on top of those functions, and route all cart reconstruction through existing server-authoritative cart mutations. Keep organisation support behind existing membership roles.

**Tech Stack:** Next.js 16.3.3, React 19, TypeScript, Drizzle/Postgres, Supabase auth/RLS, Tailwind CSS 4, Vitest, Testing Library, Playwright.

**Spec:** docs/superpowers/specs/2026-09-17-saved-lists-reorder-design.md

## Global Constraints

- Retail cart and quote basket remain separate paths.
- Money remains server-authoritative integer pesewas and VAT-inclusive.
- Client input never authorizes ownership, organisation membership, price, or product availability.
- Existing staff RBAC and customer authentication remain authoritative.
- Saved items use current active variants and current server prices when added to cart.
- Unavailable saved/order items remain visible with an explanation and are never silently deleted.
- Every mutation is validated, scope-checked, and idempotent where retries can occur.

---

### Task 1: Add saved-list schema, migration, and types

**Files:**
- Create: src/lib/db/schema/saved-lists.ts
- Modify: src/lib/db/schema/index.ts
- Create: drizzle/0018_saved_lists.sql
- Test: schema/migration smoke checks following existing database test conventions

**Interfaces:**
- Produces savedLists and savedListItems Drizzle tables plus owner-scope types.
- Consumes profiles, organizations, organizationMembers, and productVariants.

- [ ] **Step 1: Add failing schema contract checks**

Assert that a list has exactly one personal or organisation owner, list items require a variant and positive quantity, and duplicate variants within one list are rejected by the unique index.

- [ ] **Step 2: Define the schema**

Add list fields for id, profile owner, organisation owner, name, description, timestamps, and item fields for variant, quantity, note, and timestamps. Add indexes for profile owner, organisation owner, list items, and unique list/variant pairs.

- [ ] **Step 3: Write migration SQL**

Create the migration with foreign keys, cascade behavior for list ownership/items, owner-scope check constraint, positive quantity check, and indexes. Keep the migration additive and safe for existing installations.

- [ ] **Step 4: Run migration/schema checks**

Run the repository’s database migration and type checks against the local configured database. Expected: existing tables remain intact and the new schema is discoverable.

- [ ] **Step 5: Commit**

git add src/lib/db/schema drizzle/0018_saved_lists.sql
git commit -m "feat: add saved list persistence"

### Task 2: Implement server repository and authorization contracts

**Files:**
- Create: src/features/saved-lists/repository.ts
- Create: src/features/saved-lists/authorization.ts
- Create: src/features/saved-lists/types.ts
- Test: src/features/saved-lists/authorization.test.ts
- Test: src/features/saved-lists/repository.test.ts

**Interfaces:**
- Produces listSavedLists, getSavedList, createSavedList, updateSavedList, deleteSavedList, addSavedListItem, and removeSavedListItem.
- Produces scope-aware actor types for personal profiles and organisation members.
- Consumes Supabase customer identity, organisation membership, Drizzle tables, and active catalogue variant state.

- [ ] **Step 1: Write failing authorization tests**

Cover personal owner access, organisation member read access, organisation purchasing-role write access, unrelated profile denial, unrelated organisation denial, and missing authenticated actor denial.

- [ ] **Step 2: Write failing validation tests**

Cover blank names, invalid quantities, unknown variants, duplicate item merging, unauthorized list IDs, and deletion of lists outside the actor scope.

- [ ] **Step 3: Implement authorization helpers**

Resolve the authenticated profile and organisation membership on the server. Return explicit read/write decisions; do not accept role or owner identifiers from form data.

- [ ] **Step 4: Implement repository mutations**

Use transactions where a list and its item state change together. Upsert duplicate list items deterministically by increasing or replacing quantity according to the explicit operation. Return current product/variant availability and display snapshots without treating snapshots as pricing authority.

- [ ] **Step 5: Verify and commit**

pnpm test -- src/features/saved-lists
pnpm exec tsc --noEmit
git add src/features/saved-lists src/lib/db/schema
git commit -m "feat: add saved list repository permissions"

### Task 3: Add account saved-list UI

**Files:**
- Modify: src/components/account/account-nav.tsx
- Create: src/app/(account)/account/lists/page.tsx
- Create: src/app/(account)/account/lists/[id]/page.tsx
- Create: src/app/(account)/account/lists/mutate/route.ts
- Create or modify: src/components/saved-lists/saved-list-card.tsx
- Create or modify: src/components/saved-lists/saved-list-detail.tsx
- Test: account and saved-list component tests

**Interfaces:**
- Consumes repository functions from Task 2.
- Produces authenticated list management screens with empty, loading, validation, success, and error states.

- [ ] **Step 1: Write failing UI tests**

Cover list count/navigation, empty state, item availability warning, quantity editing, delete confirmation, and unauthorized response rendering.

- [ ] **Step 2: Implement account navigation**

Add Saved lists once in the account area and preserve mobile usability and active-route state.

- [ ] **Step 3: Implement list overview and detail screens**

Show scope, item count, updated date, current price, stock state, and explicit Cart and Quote actions. Keep unavailable items visible and explain why they cannot be added.

- [ ] **Step 4: Implement mutation route handling**

Validate form intent, call repository functions, return safe redirect messages, preserve errors, and avoid exposing database details.

- [ ] **Step 5: Verify and commit**

pnpm test -- src/components/account src/components/saved-lists
pnpm exec tsc --noEmit
git add src/app/(account) src/components/account src/components/saved-lists
git commit -m "feat: add account saved lists"

### Task 4: Add product save actions and explicit cart/quote reconstruction

**Files:**
- Modify: src/components/products/product-card.tsx
- Modify: src/components/products/product-quick-view.tsx
- Modify: src/app/(store)/product/[slug]/page.tsx
- Create: src/components/saved-lists/save-to-list-button.tsx
- Create: src/components/saved-lists/list-picker.tsx
- Create or modify: src/features/saved-lists/actions.ts
- Test: product card, quick view, and saved-list action tests

**Interfaces:**
- Consumes current product variant identity and saved-list repository.
- Produces a save-to-list interaction and separate add-to-cart/add-to-quote list actions.

- [ ] **Step 1: Write failing product action tests**

Cover authenticated save, unauthenticated login redirect, duplicate item handling, separate Cart and Quote actions, and no price supplied by the client.

- [ ] **Step 2: Implement save-to-list UI**

Use a compact control that works in cards, quick view, and product detail. Keep product cards uncluttered and show a dialog or sheet for list selection.

- [ ] **Step 3: Implement server actions**

Resolve the current product/variant from the server and call the repository. Never trust a client-provided product name, SKU, price, or ownership scope.

- [ ] **Step 4: Implement list-to-cart and list-to-quote actions**

Revalidate current variant activity, stock, and current price through the existing server cart/quote pathways. Return added and unavailable item summaries.

- [ ] **Step 5: Verify and commit**

pnpm test -- src/components/products src/components/saved-lists
pnpm exec tsc --noEmit
git add src/components/products src/components/saved-lists src/features/saved-lists
git commit -m "feat: save products and rebuild purchase lists"

### Task 5: Add safe reorder from account orders

**Files:**
- Modify: src/app/(account)/account/orders/page.tsx
- Modify: relevant order detail route/component
- Create: src/features/saved-lists/reorder.ts
- Create: src/components/saved-lists/reorder-button.tsx
- Modify: existing cart mutation/repository integration only where required
- Test: src/features/saved-lists/reorder.test.ts and order UI tests

**Interfaces:**
- Consumes orderItems snapshots, current variant references, current inventory/pricing rules, and existing cart mutation functions.
- Produces availability results and a retail-cart reconstruction action.

- [ ] **Step 1: Write failing reorder tests**

Cover active current variants, deleted variants, inactive variants, missing variant references, current price resolution, quantity preservation, and retail/quote isolation.

- [ ] **Step 2: Implement availability classification**

Return available, unavailable, changed, and quantity-limited items without mutating cart state.

- [ ] **Step 3: Implement reorder action**

After explicit user confirmation, add only eligible items to the retail cart using current server prices and inventory rules. Show unavailable items before and after the action.

- [ ] **Step 4: Add order UI**

Add Reorder available items to account order views with clear status feedback and a link to the cart. Do not place items directly into checkout.

- [ ] **Step 5: Verify and commit**

pnpm test -- src/features/saved-lists src/components/account
pnpm exec tsc --noEmit
git add src/features/saved-lists src/components/account src/app/(account)
git commit -m "feat: add safe order reorder flow"

### Task 6: Organisation scope and production verification

**Files:**
- Modify: src/app/(account)/account/organisation/page.tsx
- Modify: organisation repository or membership helpers only as required
- Modify: src/components/saved-lists/*
- Test: organisation and saved-list authorization tests, Playwright smoke coverage

**Interfaces:**
- Consumes organisation membership roles and saved-list repository from Tasks 2–5.
- Produces verified organisation list access without exposing personal lists.

- [ ] **Step 1: Write failing organisation tests**

Cover member read access, purchaser/admin write access, unrelated organisation denial, and personal/organisation list separation.

- [ ] **Step 2: Add organisation list selection**

Allow authorized organisation members to create and manage organisation lists while showing the owner scope clearly.

- [ ] **Step 3: Run migration and full checks**

pnpm lint
pnpm test
pnpm build
pnpm test:e2e

Expected: all checks pass or failures are diagnosed before completion claims.

- [ ] **Step 4: Run authenticated browser checks**

Verify personal list creation, product save, list-to-cart, list-to-quote, unavailable item handling, reorder, and organisation permission boundaries at mobile and desktop widths.

- [ ] **Step 5: Review diff and commit release evidence**

git diff --check
git status --short
git log -8 --oneline

Commit only intended saved-list/reorder files and report unrelated dirty-worktree files without staging them.

