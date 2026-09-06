# Implementation status

PaperSource is in **MVP launch preparation**. Core commerce, customer accounts, security baseline, storefront polish, support/legal pages, and observability wiring are implemented on `main`; the remaining work is hosted verification and operational sign-off. The product specification is not an implementation phase tracker.

## Shipped on master

Storefront and separate retail/quote paths; catalogue and server pricing; guest cart, checkout and RFQ; Paystack; admin order/quote desks; transactional email; RFQ completeness; catalogue admin.

## Current implementation (`main` and `codex/mvp-customer-accounts`)

- Quick Order and office-pack bundle definitions are committed and pushed.
- Local Supabase Auth test foundation is committed and pushed (`3e84853`). Confirmation, password login, recovery and refresh-token revocation are tested.
- Canonical customer identity checkpoint: verified Supabase claims, subject-bound profile synchronization, rejection of the legacy application cookie, and SSR refresh composed with guest identity. Verification details are in [LOCAL_AUTH.md](LOCAL_AUTH.md).
- Customer accounts: Supabase-backed registration/confirmation/login/recovery/sign-out, protected account histories, Ghana address book, one-organisation membership, actor-aware cart/quote merge, authenticated checkout/RFQ, and profile/organisation document access are implemented and verified locally.
- The legacy custom-password/customer-cookie path is retired. Guest cart, checkout, RFQ and capability-token access remain supported as a separate path.

Customer accounts are merged into both branches. Hosted Supabase/Vercel connectivity is verified (`/api/health` reports database `ok`), and the audit log migration is applied and registered. Supabase reports 30 public tables with RLS enabled; service-only tables have no anon/authenticated grants. Staff login uses Supabase Auth with database-backed roles.

The storefront now includes About, Contact, Delivery, FAQ, Terms, Privacy and Returns pages. Security response headers and client-side Sentry route telemetry are configured; runtime activation still requires the production Sentry DSN.

## Remaining MVP work, in order

1. Launch verification: complete authenticated hosted customer-account and admin journeys. Public route and API smoke checks pass; direct Vercel redeploys are temporarily blocked by the daily deployment quota.
2. Review hosted RLS policies and Supabase security advisor findings, not only RLS enablement. The advisor MCP endpoint is not currently available in this session.
3. Configure and verify the production Sentry DSN; confirm no runtime errors and no sensitive data capture.
4. Run the complete Playwright suite against production-safe test data and perform mobile/desktop smoke checks.
5. Final legal/content review of Terms, Privacy and Returns pages.
6. Optional: quote-expiring reminders at T-48h.

The local Playwright gate is not currently rerun in this workspace because the Vitest/JS DOM dependency cache is incomplete; production HTTP/browser smoke checks pass for the key public routes.

Reorder, credit ledgers, furniture, PostHog, search SaaS and a custom wordmark remain out of MVP.
