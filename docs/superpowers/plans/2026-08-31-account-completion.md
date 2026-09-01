# Customer Account Completion Implementation Plan

> **For agentic workers:** Execute with test-driven development; independent file-owned tasks may use dispatching-parallel-agents. Main integrates and verifies all results before publication.

**Goal:** Finish the previously approved customer account slice, then proceed to MVP RLS/admin work.

**Architecture:** Supabase SSR verifies customer identity; account data access enforces ownership. Retail carts and draft quotes independently resolve a server-read commerce identity, and guest data merges transactionally after authentication. Existing UI is salvaged into validated Server Actions.

**Tech Stack:** Next.js16.3.3, Supabase SSR0.12.5, Drizzle0.45.2, PostgreSQL, Zod, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-08-30-customer-accounts-design.md` (approved).

## Global constraints

- Work in the approved checkout/branch `codex/mvp-customer-accounts`; retain unrelated user changes. No merge or production deployment.
- Supabase alone supplies identity. No custom password/session fallback. Staff local-secret login unchanged.
- Server-read guest session and verified profile ID only; never claim by email. Retail and quote lines remain separate.
- Money stays integer pesewas and server-authoritative. Ghana addresses and nationwide-on-request behavior stay intact.
- The original database54329 and `.env.local` remain intact; exercise accounts using process-local configuration against guarded Supabase55321/55322. No hosted writes.
- Preserve useful WIP; remove obsolete custom-auth files only after replacing all callers. New exposed tables have RLS enabled.

## Task 1: Schema, identity-aware commerce and integration (main)

Files: `drizzle/0008_customer_accounts.sql`, `src/lib/db/schema/{identity,commerce,orders}.ts`, `src/lib/customer/commerce.ts`, `src/features/account/merge.ts`, cart/quotation repositories and their action/read callers, checkout/RFQ/order access, test scripts.

Interface: `CommerceIdentity = {sessionId: string|null; profileId: string|null}`. Repository first arguments accept `string | CommerceIdentity` for compatibility with guest-only internal test/adapters; string always means guest. `readCommerceIdentity()` combines verified actor with server-read guest cookie. `mergeGuestCommerce({profileId,sessionId})` consumes only server-verified identity and server-read cookie; no email field.

- [x] Add failing ownership/merge integration tests against isolated local fixtures. Assert guest lookups exclude profile rows, two baskets merge independently, duplicate quantities sum, replay is idempotent, other-profile/email-only records remain untouched, logout cannot read profile data.
```ts
expect(await listCartLines({profileId: null, sessionId: oldGuestId})).toEqual([]);
// A merge never uses guestEmail; only matching server-read session capabilities.
```
- [x] Correct0008 without custom credentials. Preflight duplicates/orphans; add case-insensitive profile-email uniqueness, single membership per profile, one personal default, ownership foreign keys/indexes and partial uniqueness for profile/guest carts and drafts. Refuse incompatible existing data rather than deleting it.
- [x] Serialize commerce operations/merge on consistent transaction advisory locks for profile/session identities. Use ownership predicates on every read/update/delete; authenticated cart/draft has null session. Keep quote snapshots and nullable custom variants intact.
- [x] Update action/read callers, checkout/RFQ ownership and quote-origin order linkage; order access is verified profile/org or guest-only matching session, never number alone. Saved organisation linkage requires explicit opt-in.
- [x] Apply migration twice to guarded local Supabase, seed catalogue, run real ownership/concurrency tests. Original database untouched.

## Task 2: Authentication forms/actions/callback (auth worker)

Files owned: `src/features/account/auth-actions*`, auth-service integration helpers, `src/app/(account)/{login,register,forgot-password,reset-password}`, `src/app/auth/confirm`, `src/app/account/{auth,logout}`, auth form/signout components; remove superseded `src/features/account/auth.ts` and `src/lib/customer/{constants,password,password.test,session}.ts`; `supabase/templates` and auth template config only.

Consumes existing `createCustomerAuthService`, verified actor/profile helpers and Task1 `mergeGuestCommerce({profileId,sessionId})`. Produces `signOutCustomerAction` for account nav plus login/register/reset Server Actions and real confirmation route. No schema/package/global navigation edits.

- [x] Add failing action/form/callback regressions; invalid input/foreign redirects/provider failures never authenticate or leak details.
- [x] Wire Supabase operations to validated Server Actions, safe redirects outside catches, merge after verified sign-in/confirmation and immediate signup. Sign-out calls Supabase and keeps guest cookie. Fail closed with absent configuration.
- [x] Add accessible labeled/pending/error forms, neutral confirmation/reset feedback and recovery links. Confirmation validates `token_hash` and `email|recovery`, forwards cookie/cache headers and removes secrets from redirect URLs. No tokens in logged URLs or rendered errors.
- [x] Configure local confirmation/recovery email templates to invoke the token-hash callback; no hosted changes or Docker restarts by worker.
- [x] Replace/remove all custom-auth callers, keeping no local password fallback. Tests/lint; report files and exact verification to main, no commits.

## Task 3: Account data/actions/surfaces (account worker)

Files owned: `src/features/account/{addresses,organisation,history,actions}*`, `src/app/(account)/account/**`, account address/organisation mutation routes, `src/components/account` excluding auth/signout components, `src/components/navigation/account-link.tsx`, store-header account affordance, corporate-account page.

Consumes `requireCustomer`, `readCustomerActor`, schema fields already present in WIP and upcoming unique constraints; retains existing public functions used by checkout/RFQ where practical. Nav uses auth worker `signOutCustomerAction`.

- [x] Add failing tests for cross-profile address rejection, transactional default changes, owner-only organisation edits/type validation, scoped profile/org history.
- [x] Implement Ghana address add/edit/delete/default and personal-vs-org separation. Require verified actor in Server Actions, use ownership predicates, lock profile for default/create transactions.
- [x] Create one organisation transactionally with owner membership; members read only. Validate enum values. List histories only by actor/profile or membership; no email claiming.
- [x] Finish protected overview/orders/quotes/addresses/organisation UI and mobile account access without replacing locked bottom nav. Replace first-party mutation routes with Server Actions or deny legacy handlers safely.
- [x] Unit/component tests and lint; report files and verification to main, no schema changes/commits.

## Task 4: Integrated verification and publication (main)

- [x] Add browser account journey against process-local Supabase app config, actual captured confirmation/reset links and two test customers. Cover login/logout, independent merge, address/checkout prefill, org RFQ/history, checkout/order history, quote-to-order ownership, cross-account denial, mobile/desktop/console.
- [x] Run fresh domain/component suites, Auth/profile/ownership scripts, guest Quick Order and relevant checkout/admin quote regression tests, lint/typecheck/build. Fix failures with regressions.
- [x] Request independent scoped code review; resolve security/correctness findings. Document honest status and any external blockers.
- [x] Commit/push the completed account milestone. Only then begin full RLS and delivery/settings admin using a separately recorded scope. Do not call accounts complete until the acceptance journeys pass.
