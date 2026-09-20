# Implementation status

PaperSource is in **MVP launch preparation**. Core commerce, customer accounts, security baseline, storefront polish, support/legal pages, and observability wiring are implemented on `main`; the remaining work is hosted verification and operational sign-off. The product specification is not an implementation phase tracker.

## Shipped on master

Storefront and separate retail/quote paths; catalogue and server pricing; guest cart, checkout and RFQ; Paystack; admin order/quote desks; transactional email; RFQ completeness; catalogue admin.

## Current implementation (`main` and `codex/mvp-customer-accounts`)

- Quick Order and office-pack bundle definitions are committed and pushed.
- Catalogue enrichment is complete: all 305 active products have SEO-ready descriptions, practical categories, Cloudinary-backed imagery, and non-empty image alt text. The repeatable import and image-sync scripts are `scripts/import-catalogue.mjs` and `scripts/sync-catalogue-images.mjs`.
- Delivery operations are seeded with eight standard Accra, Tema and nationwide zones, and public route smoke coverage is automated in `e2e/public-smoke.spec.ts`.
- Local Supabase Auth test foundation is committed and pushed (`3e84853`). Confirmation, password login, recovery and refresh-token revocation are tested.
- Canonical customer identity checkpoint: verified Supabase claims, subject-bound profile synchronization, rejection of the legacy application cookie, and SSR refresh composed with guest identity. Verification details are in [LOCAL_AUTH.md](LOCAL_AUTH.md).
- Customer accounts: Supabase-backed registration/confirmation/login/recovery/sign-out, protected account histories, Ghana address book, editable customer profile, one-organisation membership, actor-aware cart/quote merge, authenticated checkout/RFQ, and profile/organisation document access are implemented and verified locally.
- The legacy custom-password/customer-cookie path is retired. Guest cart, checkout, RFQ and capability-token access remain supported as a separate path.

Customer accounts are merged into both branches. Hosted Supabase/Vercel connectivity is verified (`/api/health` reports database `ok`), and the audit log migration is applied and registered. Supabase reports 30 public tables with RLS enabled; service-only tables have no anon/authenticated grants. Staff login uses Supabase Auth with database-backed roles.

The production catalogue route was rechecked after query deduplication: `/shop`, `/search`, `/about`, `/contact`, `/faq`, `/delivery`, `/api/health`, and search suggestions all returned HTTP 200 on the current Ready deployment.

The live health endpoint reports both database and observability readiness; production currently reports `database: ok` and `observability: configured`. Supabase Security Advisor is now reachable. It reports intentional informational notices for service-only tables with RLS but no policies, plus one actionable Auth warning: leaked-password protection is disabled. A direct grants check confirmed those service tables expose no privileges to `anon` or `authenticated`. Enable leaked-password protection in Supabase Auth settings before launch.

Static RLS review identified and fixed an ownership gap in quote items, quote events, and order items (`drizzle/0015_rls_child_scope.sql`). The migration has been applied to hosted Supabase and verified.

The hosted RLS migration has now been applied and verified. Security Advisor no longer reports `pg_trgm` in `public`; the remaining notices are intentional no-policy service tables, plus a warning to enable Supabase Auth leaked-password protection in the dashboard.

Hosted Performance Advisor now reports zero unindexed foreign keys after the additive index migrations (`20260908051115`, `20260908051923`, and `20260908052153`). It still reports informational unused-index notices; these are retained because the indexes cover expected production joins, referential deletes, and admin lookups and the database is not yet carrying representative production traffic.

Admin store settings now include a hosted payment gateway switch (`payments_enabled`) and runtime Paystack mode (`test` or `live`). Checkout, return verification, mock checkout, and webhooks all follow the stored mode server-side. Live mode is rejected unless a server-side `sk_live_` Paystack secret is configured; the migration is `drizzle/0017_payment_controls.sql` and has been applied to hosted Supabase.

The storefront now includes About, Contact, Delivery, FAQ, Terms, Privacy and Returns pages. Security response headers and client-side Sentry route telemetry are configured; runtime activation still requires the production Sentry DSN.

## Remaining MVP work, in order

1. Launch verification: complete authenticated hosted customer-account and admin journeys. Public route and API smoke checks pass; the local authenticated admin journey and the full local Playwright suite (27/27) now pass. The complete Vitest suite is green (80 files, 392 tests) using a single worker. Direct Vercel redeploys may still be limited by the daily deployment quota, so a pushed commit must be separately verified as Ready in Vercel.
2. Review the hosted RLS policies and the current Advisor findings during launch sign-off; enable Supabase Auth leaked-password protection.
3. Verify Sentry through the Sentry API with a read-only auth token, then confirm no runtime errors and no sensitive data capture. Vercel production already has the DSN and trace-rate variables configured, and `/api/health` reports observability as configured.
4. Run the complete Playwright suite against production-safe hosted test data and perform mobile/desktop smoke checks. The local suite is green (27/27).
5. Final legal/content review of Terms, Privacy and Returns pages.
6. Verify the hosted daily cron for quote-expiring reminders at T-48h. The reminder workflow is implemented for both guest quotes (token link) and authenticated customer quotes (account quotes link); production cron delivery still needs sign-off.

Local Playwright verification is green: 27 tests passed with the dedicated local Supabase staff fixture and mock payment/email services. Hosted authenticated journeys and cross-device smoke checks remain outstanding. The current `main` branch has passed the production build and the full Vitest suite locally; live deployment status still requires a Vercel check after each push.

Reorder, credit ledgers, furniture, PostHog, search SaaS and a custom wordmark remain out of MVP.
