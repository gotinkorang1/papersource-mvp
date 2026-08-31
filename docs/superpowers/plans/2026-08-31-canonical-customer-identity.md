# Canonical Customer Identity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Establish the application's verified Supabase customer actor and SSR cookie refresh without enabling unfinished login/commerce flows.

**Architecture:** Verify identity through Supabase `getClaims`, validate the customer subject/email, and synchronize profiles by subject only. Request-memoized account reads use this actor, never the legacy HMAC cookie. Proxy refreshes Auth cookies in both the incoming request and outgoing response, preserves guest identity, and forwards non-cacheable response headers.

**Tech Stack:** Next.js 16.3.3, Supabase SSR 0.12.5, Supabase JS 2.112.4, Drizzle, Zod, Vitest, local PostgreSQL.

**Spec:** `docs/superpowers/specs/2026-08-30-customer-accounts-design.md`, authentication architecture and customer actor sections. This checkpoint is part of milestone 2; actions and commerce ownership follow before enabling accounts.

## Global Constraints

- Work on `codex/mvp-customer-accounts`; preserve and do not stage unrelated Cursor WIP.
- Staff login stays local-secret. No `user_metadata` role authorization or service-role customer client.
- Keep `.env.local` and the original database unchanged. No hosted writes, live email or payment calls.
- Do not invoke the old email-based merge or add a new credential/session mechanism.
- Guest retail cart and quote basket remain separate; Quick Order foreign-Origin rejection must set no guest cookie.
- All customer modules are server-only. Missing Auth configuration returns a guest actor, not a fallback custom session.

## Task 1: Verified identity and profile synchronization

Files: create `src/lib/customer/identity.ts`, `identity.test.ts`, `profiles.ts`; replace uncommitted `src/lib/customer/require.ts`; add server-only marker to `src/lib/supabase/server.ts`.

Interfaces: `readVerifiedCustomerIdentity(auth)` consumes only `getClaims()` and returns `{profileId,email,fullName,phone} | null`. `synchronizeCustomerProfile(identity)` returns the same safe DTO from `profiles`; `readCustomerActor()` is request-memoized and `requireCustomer(next?: string)` redirects unauthenticated requests to a safe login destination.

- [x] Write failing identity tests: verified subject wins over forged metadata subject/role; missing/error/anonymous/malformed claims deny identity; display metadata is bounded and never provides email or identity.

```ts
expect(await readVerifiedCustomerIdentity({ getClaims: async () => ({ data: null, error: null }) })).toBeNull();
// An authenticated result with sub A and metadata.profileId B must produce A.
```

- [x] Implement Zod validation after `getClaims`; do not decode or verify JWTs manually. Reject anonymous sessions and roles other than authenticated. Normalize verified email and limit display strings.
- [x] Synchronize by profile ID in a transaction. Check case-insensitive email conflicts; never return another ID based on email. Use conflict-safe insert and read-back by ID; preserve stored display fields on subsequent reads. Surface a generic error for an identity conflict.
- [x] Replace the actor reader so `ps_customer` is ignored. Do not wire login yet: the existing account WIP stays unshipped, and new Auth configuration is not enabled in the app.
- [x] Test real profile creation, repeated sync, stored fields, email collision, and cross-profile isolation against the dedicated local Supabase database using exact temporary fixtures and cleanup.

## Task 2: SSR refresh composed with guest identity

Files: create `src/lib/supabase/proxy.ts`, `src/proxy.test.ts`; modify `src/proxy.ts`.

Interface: `refreshSupabaseSession(request: NextRequest): Promise<NextResponse>` preserves SDK cookie options and all SDK response headers, including cache prevention. It skips SDK initialization when public Auth configuration is absent.

- [x] Write failing tests with real NextRequest/NextResponse and an SDK boundary double: guest ID is available in the same request; valid guest ID survives; refreshed cookies reach browser and downstream request; repeated SDK writes retain all cookies; cache headers survive; foreign Quick Order POST stays cookie-free.

```ts
expect(response.cookies.get('ps_sid')?.value).toBe(request.cookies.get('ps_sid')?.value);
expect(response.headers.get('cache-control')).toContain('no-store');
```

- [x] Generate the guest ID before creating the request-forwarding response. Apply guest Set-Cookie after Auth refresh so response replacement cannot discard it. Keep the Quick Order handler's Origin-check boundary intact.
- [x] Call `getClaims` directly after creating the SSR client. Proxy is refresh plumbing, not authorization; data-access functions verify again.
- [x] Run targeted unit tests and the Quick Order Playwright regression suite against the unchanged original database.

## Task 3: Verify and publish

- [x] Run identity/profile and proxy tests, real Auth smoke, typecheck, changed-file lint, domain/component tests and build. Run heavy checks sequentially on this workstation.
- [x] Request scoped read-only review and fix important findings with regressions.
- [x] Document actual evidence and remaining boundary. Prepare only the scoped implementation, package/test support, status documentation and plans for publication. The Git branch history and remote tracking ref are the publication record.

Verification: 125 domain tests, 5 component tests, 22 local runtime/Auth guards, real Auth and profile/concurrency journeys, and all 9 Quick Order browser tests passed. Changed-file lint, TypeScript and the production build passed (52 generated pages, including preserved WIP). See `docs/LOCAL_AUTH.md` for the test boundary and the initial browser-server readiness timeout. The concurrent email-conflict regression failed before the generic database-conflict handling fix and passed afterward; final scoped review found no remaining issues.

## Coverage boundary

This deliberately does not enable sign-in, change the app database, replace the account migration, or call guest merge. Server Actions, confirmation/reset handlers, transactional guest merge, actor-aware commerce repositories, address/organisation permissions and account UI journeys remain required. The legacy WIP auth handler may still issue its unused cookie locally, but the new actor reader never accepts it. It must be replaced before the account UI is shipped.
