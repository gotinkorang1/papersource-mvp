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

Customer accounts are merged into both branches. Production still needs hosted Supabase/Vercel environment verification and hosted flow smoke tests. The ten Drizzle migrations (`0001`–`0010`) have been applied to the connected Supabase project, with 30 public tables and RLS enabled on all 30. Staff login remains the existing local-secret mechanism.

The storefront now includes About, Contact, Delivery, FAQ, Terms, Privacy and Returns pages. Security response headers and client-side Sentry route telemetry are configured; runtime activation still requires the production Sentry DSN.

## Remaining MVP work, in order

1. Launch verification: confirm hosted Supabase/Vercel environment variables and verify the hosted flows, including customer account and admin journeys.
2. Apply and verify `drizzle/0011_rls_child_record_ownership.sql`, then review hosted RLS policies and Supabase security advisor findings, not only RLS enablement.
3. Configure and verify the production Sentry DSN; confirm no runtime errors and no sensitive data capture.
4. Run the complete Playwright suite against production-safe test data and perform mobile/desktop smoke checks.
5. Final legal/content review of Terms, Privacy and Returns pages.
6. Optional: quote-expiring reminders at T-48h.

The local Playwright gate is complete: all 26 tests pass serially against a healthy dedicated database and development server, including the admin quote, checkout, Paystack, Quick Order, and RFQ journeys.

Reorder, credit ledgers, furniture, PostHog, search SaaS and a custom wordmark remain out of MVP.
