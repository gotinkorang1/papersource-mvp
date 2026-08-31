# Implementation status

PaperSource is in **MVP implementation**, currently completing customer accounts. The product specification is not an implementation phase tracker.

## Shipped on master

Storefront and separate retail/quote paths; catalogue and server pricing; guest cart, checkout and RFQ; Paystack; admin order/quote desks; transactional email; RFQ completeness; catalogue admin.

## Feature branch: `codex/mvp-customer-accounts`

- Quick Order and office-pack bundle definitions are committed and pushed.
- Local Supabase Auth test foundation is committed and pushed (`3e84853`). Confirmation, password login, recovery and refresh-token revocation are tested.
- Canonical customer identity checkpoint: verified Supabase claims, subject-bound profile synchronization, rejection of the legacy application cookie, and SSR refresh composed with guest identity. Verification details are in [LOCAL_AUTH.md](LOCAL_AUTH.md).

**Customer accounts are not yet enabled for users.** The storefront still uses its original database/configuration. Account screens and the old login/merge code remain separate uncommitted WIP; they must not be enabled or treated as shipped.

## Remaining MVP work, in order

1. Finish account Server Actions, confirmation/reset routes and logout; replace the unsafe WIP credential/merge path. Complete account schema, actor-aware cart/quote repositories, ownership checks, histories, Ghana address CRUD and organisation permissions. Verify guest and signed-in journeys before enabling accounts.
2. Complete RLS policy hardening; delivery-zone CRUD; VAT, quote-expiry and WhatsApp settings; useful staff customer/organisation/payment/delivery reads.
3. Storefront delivery-zone copy and remaining Product JSON-LD; stabilize the full Playwright suite, including admin quote journeys.
4. Sentry and launch verification. Vercel Analytics is already present.
5. Optional: quote-expiring reminders at T-48h.

Reorder, credit ledgers, furniture, PostHog, search SaaS and a custom wordmark remain out of MVP. Feature-branch commits are not a claim of deployment or a merge into master.
