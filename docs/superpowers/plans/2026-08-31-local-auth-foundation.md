# Local Supabase Auth Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Establish a reproducible, isolated local Supabase Auth environment and verify real confirmation, login, password recovery, and sign-out before replacing the account WIP.

**Architecture:** Run local Auth and PostgreSQL on separate ports, preserving the existing standalone database. Bootstrap only the seven committed Drizzle migrations into the new database. A local-only smoke test exercises Supabase itself without publishing incomplete account routes or trusting the custom WIP session.

**Tech Stack:** Node.js 24, pnpm, Supabase CLI 2.116.0, Docker, PostgreSQL, existing Supabase JavaScript client, Vitest.

**Spec:** `docs/superpowers/specs/2026-08-30-customer-accounts-design.md`, runtime/local development and Auth foundation. This is the first independently verifiable checkpoint within milestone 2, not completion of customer accounts.

## Global Constraints

**Checkpoint 2026-08-31:** With user approval, changed Docker Desktop's default binding to localhost and restarted it. Verified actual API/database/mail ports bind to `127.0.0.1`/`::1`; prior stopped unrelated stacks restored to stopped. Original database data and `.env.local` unchanged. Committed schema applied twice: 28 public tables, all RLS enabled, no custom credentials table. Real Auth confirmation/login/claims/recovery/signout and local email capture passed; exact fixture cleanup verified. Safe-return helper has 25 tests; runtime/target and revocation guards have 22 tests. Review caught an overly broad refresh-error assertion; a red/green regression now requires the specific revoked-token API response. Publication verification underway. This is an Auth test foundation, not enabled customer account functionality.

- Use Node.js 22 or newer; the current workstation uses Node.js 24.
- Preserve the existing standalone PostgreSQL volume. It is not deleted or migrated destructively.
- Keep secrets in `.env.local`; only publishable Supabase values use `NEXT_PUBLIC_*`.
- Continue to keep `SUPABASE_SERVICE_ROLE_KEY` server-only. Customer account reads and mutations do not use it.
- Continue using the existing Drizzle schema and `drizzle/*.sql` migration sequence. Do not introduce a second application schema history under `supabase/migrations`.
- Work occurs on `codex/mvp-customer-accounts`. Each milestone is reviewed, freshly verified, committed, and pushed before the next milestone begins.
- No hosted project changes, live email, production Paystack, or deletion of existing customer data.

## File boundaries

- `package.json`, `pnpm-lock.yaml`, pnpm build-approval config if generated: pinned CLI and reproducible local commands.
- `supabase/config.toml`: distinct project ID, ports 55321/55322/55323/55324, email confirmation enabled; no application migration history.
- `supabase/.gitignore`: ignore CLI temporary state, never commit local keys.
- `scripts/local-supabase.mjs`: local-only CLI/status/database helpers and migration bootstrap; fixed PaperSource targets.
- `scripts/test-local-auth.mjs`: real local Auth smoke journey; no application session or profile authorization bypass.
- `src/lib/customer/return-path.ts` and `.test.ts`: strict local auth return-path allow-list for the subsequent SSR/Auth wiring.
- `docs/LOCAL_AUTH.md`: setup, URLs, commands, exact verification, and the subsequent account wiring boundary.
- Existing account WIP and `.env.local` stay unchanged in this checkpoint. App/database switching happens with the verified SSR/session and commerce-ownership implementation.

## Task 1: Install and start an isolated local Auth runtime

**Consumes:** healthy Docker; existing PostgreSQL on 54329.
**Produces:** local Auth API on 55321, PostgreSQL on 55322, local email inbox on 55324.

- [x] Install `pnpm add -D -E supabase@2.116.0 --allow-build=supabase`; inspect lockfile changes for unrelated version movement.
- [x] Discover `pnpm exec supabase --help`, `init --help`, `start --help`, and `status --help` before using commands.
- [x] Run CLI initialization, then set project ID `papersource-auth` and distinct ports using `apply_patch`. Enable email confirmations, set `site_url = "http://localhost:3000"`, and allow only local callback/reset destinations. Retain default email templates until application callbacks exist, so local confirmation links are functional now.
- [x] Disable unneeded local services in configuration or the documented CLI exclusions to reduce memory demand. Keep Auth, gateway, database and mail. Bind a project-specific Docker network to 127.0.0.1 using the documented `host_binding_ipv4` option.
- [x] Start through the pinned CLI. Verify health with a real HTTP request, inspect container port bindings, and verify the original PostgreSQL container still runs on 54329. Never reset either volume to recover an error.

## Task 2: Bootstrap the committed database schema only

**Produces:** `bootstrapLocalDatabase(): Promise<void>` in `scripts/local-supabase.mjs`; all committed public application tables created with RLS enabled.

- [x] Assert the local database initially lacks `public.products` with a read-only query. This proves the bootstrap is needed.
- [x] Implement a CLI-invoked bootstrap that connects only to `postgresql://postgres:postgres@127.0.0.1:55322/postgres`, reads the seven exact committed migration filenames, and applies them sequentially. Do not include uncommitted `0008_customer_accounts.sql`.

```js
const migrations = [
  "0001_catalogue.sql", "0002_carts_quotes.sql", "0003_orders_rfq.sql",
  "0004_payments.sql", "0005_admin_quotes.sql", "0006_quote_documents.sql",
  "0007_staff_catalogue_roles.sql",
];
for (const file of migrations) {
  await db.unsafe(await readFile(new URL(`../drizzle/${file}`, import.meta.url), "utf8"));
}
```

- [x] Set the connection search path to `public, extensions` for Supabase extension compatibility. Close the connection in `finally`. Print migration names/counts, not connection secrets or row contents.
- [x] Run twice to verify the inherited migrations remain repeatable. Query that `products`, `profiles`, `orders`, and `quotes` exist and every public application table has RLS enabled. Verify no `customer_credentials` table exists in this new database.

## Task 3: Prove real Auth behavior without the application cookie

**Produces:** `pnpm auth:test` local smoke command, using `createClient` with the local public key obtained from CLI status. Status secrets must never be printed.

- [x] Smoke test refuses non-local API/database hosts before any mutation. It creates a unique `auth-smoke-<uuid>@papersource.test` account using a random password; external email delivery is not used.
- [x] Assert registration returns a user but no session; assert unconfirmed password login fails. Read only this test user's confirmation token from the local email inbox or local Auth fixture row, then call `verifyOtp` through the real Auth API and assert the returned subject matches the newly created user.
- [x] Sign out, sign in with the confirmed password, call `getClaims`, and assert the subject. Do not authorize using `getSession` data.
- [x] Request password recovery, obtain the local test-user recovery token, verify it via Auth, and update the password. Assert old-password login fails and new-password login succeeds.
- [x] Sign out and assert the revoked refresh token cannot obtain a new session. Do not incorrectly expect an already-issued JWT to expire immediately.
- [x] Remove only the exact Auth user created by this run in `finally` using a local-only test fixture cleanup; never delete by broad email prefix. Do not remove unrelated mail/users.

## Task 4: Add strict safe return paths for upcoming Auth wiring

**Produces:** `safeCustomerReturnPath(value: unknown): string`, default `/account`. Allows the five account routes, `/cart`, `/quote`, `/checkout`, and `/request-quote`; no query/hash/encoded/admin/external destinations.

- [x] Write table-driven failing tests, including these independently derived cases:

```ts
it.each([
  ["/account/orders", "/account/orders"], ["/checkout", "/checkout"],
  ["https://evil.example", "/account"], ["//evil.example", "/account"],
  ["/%2f%2fevil.example", "/account"], ["/admin", "/account"],
  ["/account/../admin", "/account"], [null, "/account"],
])("normalizes %s to %s", (input, expected) => {
  expect(safeCustomerReturnPath(input)).toBe(expected);
});
```

- [x] Observe failure with `pnpm exec vitest run src/lib/customer/return-path.test.ts --pool=threads --environment=node`.
- [x] Implement exact string membership in a `Set`; unrecognized inputs return `/account`. Run again and observe a pass. This helper is intentionally not wired into the unsafe WIP login handler.

## Task 5: Review, document and publish the foundation checkpoint

- [x] Run the local Auth smoke journey, safe-path tests, typecheck and changed-file lint. Request read-only review of local-only safety and script behavior; fix important findings with regressions.
- [x] Document setup and resource constraints, the local URLs, and the fact that the storefront still uses its original database pending SSR/ownership wiring. Include official documentation links consulted.
- [x] Stage only this plan's new foundation files and package/config changes. Inspect the staged diff and confirm no custom-account WIP or secrets entered it.
- [ ] Commit `feat: establish local Supabase Auth test foundation` and push the existing feature branch. Record actual runtime availability and smoke-test evidence, not merely configuration presence.

## Self-review and remaining dependency boundary

This plan covers local runtime, non-destructive schema bootstrap, real confirmation/recovery/session verification, and redirect validation. Customer-facing signup/login/logout/reset, verified-profile DAL, removal of custom credentials, and proxy cookie refresh remain required. Those must be implemented with safe commerce ownership/merge before publishing account functionality; the existing email-based claiming function must not be called by the new Auth path.
