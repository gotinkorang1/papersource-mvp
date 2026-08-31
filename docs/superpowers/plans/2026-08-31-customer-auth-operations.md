# Customer Auth Operations Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans for this tightly coupled backend checkpoint. Steps use checkbox syntax.

**Goal:** Implement and verify the application authentication operations against real Supabase, ready for Server Actions and confirmation routes.

**Architecture:** A server-only service validates unknown input, calls the supplied request-scoped Supabase Auth client, and returns neutral, token-free results. Successful session creation verifies claims and synchronizes the subject-bound profile. It has no commerce or custom-credential dependency. UI/action wiring waits for safe commerce ownership.

**Tech Stack:** Supabase SSR 0.12.5, Supabase JS 2.112.4, Zod, Vitest, local Supabase/PostgreSQL.

**Spec:** `docs/superpowers/specs/2026-08-30-customer-accounts-design.md`, authentication architecture. This implements the operation layer of milestone 2, not the entire account experience.

## Global Constraints

- Continue in the approved current checkout on `codex/mvp-customer-accounts`. Preserve unrelated Cursor WIP; stage exact files only.
- Supabase is the only identity provider. No password database, application session cookie, service-role client or email-based profile claiming.
- Keep `.env.local`, original database, staff authentication, guest cart and quote basket unchanged.
- No new public endpoints or enabled account UI in this checkpoint. No guest merge until actor-aware repositories and transactional merge are verified.
- Auth clients are request-scoped and supplied server-internally. Callback origin comes from trusted site configuration, never request/form headers.
- Tests use the guarded loopback-only `papersource-auth` stack. No hosted writes or live email/payment calls.

## Task 1: Validated Auth operations

Files: `src/features/account/auth-service.ts`, `src/features/account/auth-service.test.ts`.

Interface: `createCustomerAuthService({ auth, siteUrl, synchronizeProfile })`, with `register`, `login`, `confirm`, `requestPasswordReset`, `updatePassword`, `signOut`. Inputs are unknown. Results discriminate `error`, `email_sent`, `signed_in`, `password_updated`, `signed_out`. Only `signed_in` includes the safe customer DTO and allow-listed local `next`; tokens/provider errors never escape.

- [x] Write failing tests for validation, email/password normalization boundaries, safe callback origin/destination, confirmation-required and immediate-session signup, neutral duplicate signup, invalid login, verified-subject synchronization, profile failure, invalid/replayed confirmation, reset-email neutrality, authenticated password update and real sign-out failure reporting.

```ts
expect(await service.login({email: 'invalid', password: 'x'})).toMatchObject({status: 'error'});
expect(await service.register(validRegistration)).toEqual({status: 'email_sent'});
```

- [x] Run `pnpm exec vitest run src/features/account/auth-service.test.ts --pool=threads --environment=node` and record RED before implementation.
- [x] Implement Zod schemas: email trimmed/lowercased/max254; registration name trimmed/min1/max120; optional phone trimmed/max30; new passwords min8/max128, never trimmed; login passwords min1/max128. Password update requires matching confirmation. Callback accepts only nonempty bounded token hashes and `email | recovery` types. Recovery always leads to `/reset-password`; other destinations use existing safe-return allow-list.
- [x] Use only a trusted HTTPS site origin or loopback HTTP origin; reject credentials, path, query and fragment configuration. Signup callback is `/auth/confirm?type=email&next=...`; reset callback is `/auth/confirm?type=recovery`. Token-hash email-template routing will be wired with the route milestone.
- [x] Session-producing success calls `readVerifiedCustomerIdentity` then `synchronizeProfile`; ignore raw session user/metadata IDs. Confirmation-required registration does not read claims or touch profiles. On a failed post-auth identity/profile step, attempt local Supabase sign-out and return a neutral failure. Normal sign-out uses global scope and never reports success if the provider fails.
- [x] Return identical neutral email-sent state for duplicate signup and successful signup awaiting confirmation. Do not expose provider messages, SQL details or credentials. Reset request uses provider's neutral unknown-email contract; unexpected failures return a generic error.
- [x] Run tests, changed-file lint and typecheck.

## Task 2: Real SSR-backed application journey and publication

Files: `scripts/test-customer-auth.mjs`, `package.json`, `docs/LOCAL_AUTH.md`, `docs/STATUS.md`, this plan.

- [x] Write the integration test using real `createServerClient`, an in-process cookie jar representing browser/request cookies, and the production Auth service/profile synchronization. Verify the local runtime before any fixture write; process-local database override only.
- [x] Exercise registration requiring confirmation, rejected unconfirmed login, confirmation, repeated-token rejection, login across fresh SSR client instances, verified profile ID, recovery request/verification, password update, old-password rejection, successful new-password login and sign-out removing account access on the next SSR client. Assert guest cookie survives and no custom customer cookie is issued.
- [x] Read token hashes only from the exact local Auth fixture. Revoke fixture sessions and delete only exact profile/Auth fixture IDs and email. Never print tokens, passwords or raw CLI status. Captured fixture email may remain in the local inbox.
- [x] Add `auth:test:customer` using `node --conditions=react-server --import tsx scripts/test-customer-auth.mjs`; run it against the guarded local stack. No app config changes are necessary.
- [x] Request independent scoped review. Fix findings with regressions, run unit/component/Auth/profile checks and production build sequentially, document actual results and remaining UI/ownership boundary. See verification/review limitation below.
- [x] Prepare exact checkpoint files for commit/push; the branch history and remote tracking ref record publication. Do not merge or deploy.

## Verification and review record

- Initial RED: the new operation test suite failed because the implementation module did not yet exist. After implementation, 54 cases passed; review-driven error-branch coverage brought this to 58.
- All 26 domain test files passed (183 tests); all 3 component files passed (5 tests).
- `pnpm auth:test`, `pnpm auth:test:profiles`, and `pnpm auth:test:customer` passed. The latter exercised production operations with real SSR cookies and removed its exact fixtures; it passed again after cleanup hardening.
- Changed-file ESLint, `tsc --noEmit` and `pnpm build` passed. The build generated 52 pages and includes preserved account WIP, not a claim that those routes are shipped.
- Independent read-only service review found no Critical/Important issues. Its Minor coverage finding was addressed with four targeted tests. The follow-up review was unavailable due to reviewer usage limits; no independent integration-script/fix re-review is claimed.
- No application environment, schema, public endpoint, staff authentication, or commerce behavior changed. No new UI/browser account journey is claimed.

## Scope review

This is the backend operation layer of the approved account design. Server Actions, callback HTTP/cache handling, custom email template wiring, accessible forms, corrected account migration, guest merge, ownership and complete browser account journeys remain required before activation. No production account-flow completion is claimed here.
