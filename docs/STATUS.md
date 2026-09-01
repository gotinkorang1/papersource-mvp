# Implementation status

PaperSource is in **MVP implementation**. The customer-account, RLS/settings, operational-read, storefront-polish, and server-observability milestones are complete on its feature branch; the next milestone is launch verification. The product specification is not an implementation phase tracker.

## Shipped on master

Storefront and separate retail/quote paths; catalogue and server pricing; guest cart, checkout and RFQ; Paystack; admin order/quote desks; transactional email; RFQ completeness; catalogue admin.

## Feature branch: `codex/mvp-customer-accounts`

- Quick Order and office-pack bundle definitions are committed and pushed.
- Local Supabase Auth test foundation is committed and pushed (`3e84853`). Confirmation, password login, recovery and refresh-token revocation are tested.
- Canonical customer identity checkpoint: verified Supabase claims, subject-bound profile synchronization, rejection of the legacy application cookie, and SSR refresh composed with guest identity. Verification details are in [LOCAL_AUTH.md](LOCAL_AUTH.md).
- Customer accounts: Supabase-backed registration/confirmation/login/recovery/sign-out, protected account histories, Ghana address book, one-organisation membership, actor-aware cart/quote merge, authenticated checkout/RFQ, and profile/organisation document access are implemented and verified locally.
- The legacy custom-password/customer-cookie path is retired. Guest cart, checkout, RFQ and capability-token access remain supported as a separate path.

**Customer accounts are complete on this feature branch, not deployed or merged to master.** Production still needs hosted Supabase environment configuration and the migration applied through the deployment process. Staff login remains the existing local-secret mechanism.

## Remaining MVP work, in order

1. Stabilize the full Playwright suite, including admin quote journeys; the storefront delivery copy and Product JSON-LD polish is complete. The current run is blocked by intermittent `127.0.0.1:54329` standalone-Postgres connection timeouts, so CI should use a healthy dedicated database container.
2. Launch verification: hosted Supabase/Vercel environment configuration, migration rollout, and a clean full Playwright run. Vercel Analytics and server-side Sentry instrumentation are present.
3. Optional: quote-expiring reminders at T-48h.

Reorder, credit ledgers, furniture, PostHog, search SaaS and a custom wordmark remain out of MVP. Feature-branch commits are not a claim of deployment or a merge into master.
