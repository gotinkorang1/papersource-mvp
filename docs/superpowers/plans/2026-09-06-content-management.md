# Content management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder Pages, FAQs, and Navigation admin desks with secure CRUD and published-only public rendering while preserving current fallbacks.

**Architecture:** Add three focused Drizzle tables and repositories. Public server components query published content and fall back to existing constants when no records are available. Admin routes use the existing staff RBAC, form-post mutation pattern, Zod validation, and audit logger.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Drizzle ORM/Postgres, Supabase RLS, Zod, Vitest.

**Spec:** `docs/superpowers/specs/2026-09-06-content-management-design.md`

## Global Constraints

- Dual cart/quote paths remain unchanged.
- Money remains integer pesewas and is not stored in content tables.
- Public users see only published/active rows.
- Service-role credentials remain server-only.
- Existing hard-coded FAQ and navigation remain functional fallbacks.
- New public content is server-rendered and receives canonical metadata.

### Task 1: Database schema and migration

**Files:**
- Create: `src/lib/db/schema/content.ts`
- Modify: `src/lib/db/schema/index.ts`
- Create: `drizzle/0014_content_management.sql`
- Create: `scripts/apply-content-migration.mjs`

**Interfaces:**
- Produces `contentPages`, `faqs`, and `navigationItems` Drizzle tables.
- Migration creates matching Postgres tables, constraints, indexes, and RLS policies.

- [ ] Write schema tests that assert status defaults and table column names.
- [ ] Run the focused schema test and confirm it fails before the tables exist.
- [ ] Implement the Drizzle schema and SQL migration with slug/position/status checks.
- [ ] Add a dotenv-aware migration script matching `scripts/apply-product-reviews.mjs`.
- [ ] Apply the migration to the configured database and verify each table exists.
- [ ] Run TypeScript and commit `feat: add content management schema`.

### Task 2: Public repositories and fallback contracts

**Files:**
- Create: `src/features/content/repository.ts`
- Create: `src/features/content/fallbacks.ts`
- Create: `src/features/content/repository.test.ts`

**Interfaces:**
- `listPublishedPages(): Promise<ContentPage[]>`
- `getPublishedPage(slug: string): Promise<ContentPage | null>`
- `listPublishedFaqs(): Promise<Faq[]>`
- `listActiveNavigation(placement: NavigationPlacement): Promise<NavigationItem[]>`
- Each query returns an empty list when the database is unavailable so callers can use fallbacks.

- [ ] Write tests for published-only filtering, position ordering, and empty fallback results.
- [ ] Run tests to verify the new repository functions fail initially.
- [ ] Implement repository queries and fallback constants for the current FAQ and navigation links.
- [ ] Run focused tests and confirm they pass.
- [ ] Commit `feat: add published content repositories`.

### Task 3: Admin RBAC, queries, and mutations

**Files:**
- Modify: `src/lib/staff/rbac.ts`
- Create: `src/features/content/admin.ts`
- Create: `src/features/content/admin.test.ts`
- Create: `src/app/admin/pages/mutate/route.ts`
- Create: `src/app/admin/faqs/mutate/route.ts`
- Create: `src/app/admin/navigation/mutate/route.ts`

**Interfaces:**
- `listAdminPages(role)`, `listAdminFaqs(role)`, `listAdminNavigation(role, placement)`.
- `savePage(input)`, `setFaqStatus(input)`, `saveNavigationItem(input)` validate role and fields.
- Mutation routes accept form posts, redirect with `error` on failure, and record audit events.

- [ ] Add RBAC matrix entries for `pages`, `faqs`, and `navigation` for each staff role.
- [ ] Write validation tests for safe slugs, URL rules, position bounds, and content length.
- [ ] Implement admin queries/mutations and audit calls.
- [ ] Run focused tests and TypeScript.
- [ ] Commit `feat: add content admin operations`.

### Task 4: Responsive admin desks

**Files:**
- Create: `src/app/admin/(console)/pages/page.tsx`
- Create: `src/app/admin/(console)/faqs/page.tsx`
- Create: `src/app/admin/(console)/navigation/page.tsx`
- Modify: `src/components/admin/nav.ts`

**Interfaces:**
- Pages desk provides create/edit/publish/preview controls.
- FAQs desk provides question/answer/order/status controls.
- Navigation desk provides placement/label/href/order/active controls.

- [ ] Add tests for each desk’s role guard and empty state.
- [ ] Implement accessible responsive tables/forms using existing admin field/button components.
- [ ] Add preview links and visible status badges.
- [ ] Run admin component tests and lint.
- [ ] Commit `feat: add content management admin desks`.

### Task 5: Public rendering and structured data

**Files:**
- Modify: `src/app/(store)/faq/page.tsx`
- Create: `src/app/(store)/pages/[slug]/page.tsx`
- Modify: `src/components/navigation/site-links.tsx`
- Modify: `src/components/navigation/store-footer.tsx`
- Modify: `src/components/navigation/store-header.tsx`
- Create: `src/features/content/json-ld.ts`
- Create: `src/features/content/json-ld.test.ts`

**Interfaces:**
- Public FAQ uses published rows or the existing fallback FAQ list.
- Page route renders published page content and returns not-found for drafts/missing slugs.
- Header/footer use active database navigation or current links as fallback.
- `faqJsonLd(items)` emits `FAQPage` JSON-LD for visible questions only.

- [ ] Write JSON-LD and fallback rendering tests.
- [ ] Implement server-rendered public queries with safe fallback behavior.
- [ ] Add page-specific canonical/Open Graph metadata using `pageMetadata`.
- [ ] Run focused tests, TypeScript, and lint.
- [ ] Commit `feat: render published managed content`.

### Task 6: End-to-end verification and release

**Files:**
- Modify: `e2e/admin.spec.ts` or create focused content spec under `e2e/`.
- Modify: `docs/PRODUCT.md` with staff content-management instructions.

- [ ] Add authenticated admin flow: create draft → preview → publish → verify public page.
- [ ] Add anonymous flow proving drafts are not visible.
- [ ] Run `pnpm test`, `pnpm exec tsc --noEmit`, `pnpm lint`, and `pnpm run build`.
- [ ] Run Supabase advisor/security checks for the three new tables and fix findings.
- [ ] Commit `test: verify content management workflows`.
- [ ] Push the completed milestone to `codex/mvp-customer-accounts` and `main`.
