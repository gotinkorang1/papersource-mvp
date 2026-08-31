# Local customer Auth development

Customer accounts are being migrated to real Supabase Auth. This verified local test foundation does not enable the unfinished account UI or the old custom password/session implementation.

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

`auth:bootstrap` applies only the seven committed `drizzle/*.sql` migrations to the fixed local Supabase database. It does not read the current `DATABASE_URL`, reset a volume, apply the uncommitted account migration, or create a second application migration history under `supabase/migrations`. Newly created tables are not automatically granted Data API access; all application tables must have RLS enabled.

The storefront's `.env.local` and original database remain unchanged at this checkpoint. Switching the application to this database belongs with verified SSR identity, the corrected account schema, and actor-aware commerce repositories. Do not set `AUTH_MODE=live` to activate the WIP: its separate `ps_customer` cookie and email-based quote-claiming code must be replaced first.

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

## Sources

- [Supabase local development](https://supabase.com/docs/guides/local-development)
- [CLI configuration](https://supabase.com/docs/guides/local-development/cli/config)
- [Password-based Auth](https://supabase.com/docs/guides/auth/passwords)
- [Server-side Auth clients](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Docker Desktop networking and default binding](https://docs.docker.com/desktop/features/networking/)
- [Docker network port-binding defaults](https://docs.docker.com/engine/network/port-publishing/)

Production will require a separate hosted-project configuration and reliable SMTP delivery. No hosted project is modified by these local commands.
