# PaperSource storefront UI refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make shared PaperSource storefront surfaces polished, responsive, accessible, and consistent.

**Architecture:** Extend existing CSS tokens and shared navigation/components first, then apply the patterns to page-family shells. No commerce or auth behavior changes.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, existing UI primitives, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-08-storefront-ui-refresh-design.md`

## Global Constraints

- Preserve the PaperSource palette, typography, separate Cart/Quote paths, and server-authoritative commerce behavior.
- No new UI framework, animation dependency, or unrelated catalogue/data changes.
- Mobile must avoid overflow and respect safe-area insets.
- Honour reduced motion and visible focus indicators.

## Tasks

### Task 1: Shared storefront shell

**Files:** `src/components/navigation/store-header.tsx`, `mobile-nav.tsx`, `mobile-menu.tsx`, announcement components, `store-footer.tsx`, `store-shell.tsx`.

- [ ] Add focused tests for active navigation, Cart/Quote visibility, escape behavior, and mobile safe-area spacing.
- [ ] Run tests and observe expected failures.
- [ ] Refine header density, logo sizing, active states, touch targets, bottom-nav spacing, and theme surfaces.
- [ ] Verify keyboard and reduced-motion behavior.
- [ ] Run focused tests and commit `feat: polish shared storefront navigation`.

### Task 2: Reusable visual surfaces

**Files:** `src/app/globals.css`, UI button/input/badge/skeleton components, product card and category tile.

- [ ] Add tests for button states, badge contrast, skeleton presence, and product dual CTAs.
- [ ] Run tests red, implement token-based surface/state refinements, then run green.
- [ ] Commit `feat: standardize storefront visual surfaces`.

### Task 3: Page-family layout pass

**Files:** storefront route shells and product/catalogue/cart/quote/checkout/account/content components.

- [ ] Add route smoke assertions for headings, no overflow, and stable loading/error states.
- [ ] Apply shared containers, headings, cards, forms, tables, and empty/error states across page families.
- [ ] Verify mobile list mode and desktop grid/content modes.
- [ ] Run smoke checks and commit `feat: polish page-family layouts`.

### Task 4: Responsive and theme audit

**Files:** `src/app/globals.css` and only files identified by the audit.

- [ ] Add checks for 320px, 390px, 768px, 1280px, dark mode, keyboard, and reduced motion.
- [ ] Fix identified overflow, contrast, focus, and motion issues with existing tokens/APIs.
- [ ] Commit `fix: harden responsive and theme states`.

### Task 5: Release verification

- [ ] Run `pnpm lint`.
- [ ] Run `pnpm exec tsc --noEmit`.
- [ ] Run `pnpm test`.
- [ ] Run `pnpm run build`.
- [ ] Run `git diff --check` and review staged scope.
- [ ] Run responsive Playwright smoke checks against the local production build.
