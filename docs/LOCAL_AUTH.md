# Local customer Auth development

Customer accounts use real Supabase Auth. The public forms, token-hash callbacks, SSR cookies, account UI and actor-aware commerce integration are complete on `codex/mvp-customer-accounts`; this document describes the guarded local verification environment.

## Docker Desktop binding (verified 2026-08-31)

Docker Engine 29.7.2 on this workstation initially published a no-service test container on `0.0.0.0` and `::` despite the custom network's `host_binding_ipv4=127.0.0.1` option. With user approval, Docker Desktop's `PortBindingBehavior` was changed to `default-local-port-binding` and Docker restarted. Actual Auth API/database/mail bindings now use `127.0.0.1` and `::1`. Startup runs a disposable, no-service binding probe and refuses to launch Auth when effective ports are not loopback-only. The probe container is removed by its exact ID; runtime bindings are checked again after startup and before bootstrap/testing.

This is a workstation setting, not something the project scripts change automatically. Docker Desktop 4.52+ supports this port-binding setting. Other workstations must independently pass the probe. Before changing Docker settings or restarting, check other projects with the owner. A backup is retained at `%APPDATA%/Docker/settings-store.papersource-before-local-binding.json`; restore only the relevant setting if rolling back, without overwriting newer settings. The original standalone database volume/data and `.env.local` remain unchanged; its existing port 54329 now also defaults to localhost. Two unrelated stacks auto-started on restart and were returned to their prior stopped state without deleting volumes.

## Start and stop

Use Node.js 22+ (24 on the current workstation), Docker Desktop, and the repository's pnpm version.

```powershell
pnpm install --frozen-lockfile
pnpm auth:start
pnpm auth:bootstrap
pnpm auth:test
pnpm auth:stop
```

The project pins Supabase CLI **2.116.0**. `auth:start` creates/verifies the `papersource-auth-local` Docker network and tests Docker's effective port binding before launching services. First startup downloads the required images and can take several minutes. Unused Studio, Storage, Realtime, Edge Runtime and analytics services are disabled to reduce resource use.

| Service | Address |
| --- | --- |
| Supabase API / Auth | `http://127.0.0.1:55321` |
| Supabase PostgreSQL | `127.0.0.1:55322`, database/user/password `postgres` (local only) |
| Captured Auth email | `http://127.0.0.1:55324` |
| Original PaperSource PostgreSQL | `127.0.0.1:54329` — unchanged |

`auth:stop` targets only `papersource-auth`, retaining its volumes. It does not use `--all` or `--no-backup`. Do not expose this development stack to the LAN/internet or use its default database password in production.

## Database and storefront boundary

`auth:bootstrap` applies all eight committed `drizzle/*.sql` migrations to the fixed local Supabase database. It does not read the current `DATABASE_URL`, reset a volume, or create a second application migration history under `supabase/migrations`. Newly created tables are not automatically granted Data API access; all application tables must have RLS enabled.

The storefront's `.env.local` and original database remain unchanged. Verification supplies the isolated database/Auth values only to the test process. There is no `AUTH_MODE` or custom `ps_customer` fallback; Supabase claims are the customer identity.

## Verification contract

The Auth smoke test proves unconfirmed signup cannot log in, confirmation creates a verified identity, password login and verified claims work, recovery changes the password, and sign-out prevents refresh-token reuse. It creates a uniquely named local fixture and cleans up only that fixture and its sessions. Tokens are read from that exact fixture in the local Auth database and exchanged through the real Auth API; this is a test adapter, not application authorization logic. Confirmation and recovery emails are verified in the local inbox. Captured fixture emails remain there; the test never deletes unrelated messages. Passwords, tokens, secret API keys and raw CLI status are not printed.

Verified: the seven committed migrations applied twice; all **28 public tables** have RLS enabled; `products`, `profiles`, `orders` and `quotes` exist; no `customer_credentials` table exists. The real Auth smoke journey passed and left no test users. This checks RLS enablement, not the completeness of existing policies: full policy hardening remains a later MVP milestone.

Customer redirect parsing accepts exact known local destinations only, falling back to `/account` for external, admin, encoded, unknown, query-bearing or malformed values. Run:

```powershell
pnpm exec vitest run src/lib/customer/return-path.test.ts --pool=threads --environment=node
node --test scripts/local-supabase.test.mjs
pnpm auth:test:guards
```

`auth:test:guards` runs all 22 runtime/target and revoked-token regression tests without Docker. `auth:test` runs those guards first, then the real local Auth journey. Revocation requires HTTP 400 with `refresh_token_not_found`; transport failures, rate limits and server errors cannot count as a pass.

Final checkpoint verification (2026-08-31): `pnpm auth:test` passed; domain Vitest passed 22 files/104 tests; component Vitest passed 3 files/5 tests; changed-file ESLint passed; `pnpm build` passed, including TypeScript and 52 generated pages. The build includes preserved account WIP in the working tree, not a claim that those routes are in this commit. A concurrent component/build run timed out during worker startup; the unchanged component suite passed when run independently. Read-only review approved the foundation after the revoked-token assertion regression was fixed.

## Canonical identity checkpoint

The application's customer actor now comes from Supabase `getClaims()` and a profile selected by that verified subject. The old `ps_customer` cookie does not authorize reads. Anonymous or malformed claims are rejected; editable metadata supplies bounded display fields only. A matching email never selects another profile. The profile transaction handles repeated/concurrent first creation and competing email changes without returning database details.

The proxy makes a newly created guest ID available to the same request, preserves it while refreshing Supabase cookie chunks, and forwards SDK cache-prevention headers. Quick Order still validates Origin before creating a guest cookie.

Run the real profile test with `pnpm auth:test:profiles`. It verifies the dedicated local stack, overrides `DATABASE_URL` only inside its process, and removes only its exact temporary profile fixtures. It never modifies `.env.local` or the original database. This tests profile persistence; `pnpm auth:test` separately exercises real Auth.

The new actor reader is wired into the local account WIP, but its login/logout forms, credential table and email-claiming merge are not shipped or enabled. Keep the app's Supabase configuration unset until those paths are replaced together with commerce ownership. Staff login remains unchanged.

Verification (2026-08-31): domain Vitest passed 25 files/125 tests, including 21 identity/actor/proxy regressions; component Vitest passed 3 files/5 tests. The real profile persistence/concurrency test and `pnpm auth:test` (22 guards plus the real Auth journey) passed. Changed-file ESLint and TypeScript passed; `pnpm build` passed with 52 generated pages. All 9 Quick Order Playwright tests passed after starting the dev server separately following an initial web-server readiness timeout. Build and broad test counts include preserved, uncommitted account WIP; they do not certify that WIP for release. Scoped read-only review cleared this checkpoint after the concurrent email-conflict regression was added and fixed.

## Authentication operation layer

`src/features/account/auth-service.ts` supplies server-only registration, login, token-hash confirmation, reset-email request, password update and global sign-out operations. Inputs are bounded and validated; passwords are never trimmed. Callback origins come from trusted site configuration, not form/request headers. Results contain only safe form state or a verified customer DTO, never Auth tokens or provider/database error details. Successful session creation verifies claims and synchronizes the profile; a post-auth profile failure attempts local sign-out and returns a neutral failure.

Run `pnpm auth:test:customer` to exercise these application operations using the real SSR SDK and dedicated local Auth/database. A Node cookie-jar adapter represents browser/request transport and clients are recreated between operations. Coverage includes unconfirmed-signup denial, profile creation only after confirmation, token replay rejection, persisted login, recovery from a separate browser, changed/old password behavior, and sign-out clearing next-request identity while preserving the guest cookie. The script removes only its unique Auth/profile fixtures and sessions; captured local emails remain. The existing `auth:test` separately verifies refresh-token revocation and local email delivery.

The public account flow now uses Server Actions, accessible forms, `/auth/confirm` token-hash callbacks and local confirmation/recovery templates. Production still needs hosted Supabase configuration, reliable custom SMTP and reviewed provider rate limits. Signing out removes this browser's cookies and revokes refresh tokens; already-issued access JWTs on other browsers remain valid until expiry.

Operation-layer verification (2026-08-31): **183 domain tests** (including 58 new Auth-operation cases), **5 component tests**, **22 local Auth guards**, the real Auth smoke, profile/concurrency test and SSR-backed application Auth journey passed. Changed-file ESLint, TypeScript and the production build passed (52 generated pages, including preserved WIP). The application Auth journey passed again after hardening fixture cleanup. Independent read-only service review found no blocking issues and identified a provider-error coverage gap; four targeted cases were added. The follow-up reviewer hit a usage limit, so the added tests and integration script did not receive a completed independent review. No new UI was added or browser account-flow completion claimed.

## Sources

- [Supabase local development](https://supabase.com/docs/guides/local-development)
- [CLI configuration](https://supabase.com/docs/guides/local-development/cli/config)
- [Password-based Auth](https://supabase.com/docs/guides/auth/passwords)
- [Server-side Auth clients](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Docker Desktop networking and default binding](https://docs.docker.com/desktop/features/networking/)
- [Docker network port-binding defaults](https://docs.docker.com/engine/network/port-publishing/)

Production will require a separate hosted-project configuration and reliable SMTP delivery. No hosted project is modified by these local commands.

## Completed customer-account milestone (2026-09-01)

The account integration is complete on the feature branch. Verification used process-local configuration against the guarded Supabase stack and left `.env.local`, the original database and hosted services untouched. The migration and catalogue preparation ran twice; the real Auth smoke, profile synchronization, application Auth, account-data, commerce-ownership and RFQ concurrency scripts passed and removed only their exact fixtures. Vitest passed 32 domain files/234 tests and 6 component files/22 tests; ESLint, TypeScript and the 55-page production build passed. A production-build Playwright journey passed desktop/mobile rendering, real captured confirmation and recovery links, SSR cookie propagation, independent basket merge, Ghana address/checkout prefill, mock Paystack initialization, explicit saved-organisation RFQ sharing, account histories, global sign-out and logged-out ownership denial, with no application console errors. The standalone local server intentionally has no Vercel Analytics collector, so only its expected `/_vercel/insights/script.js` 404 is excluded from that console gate.
