# Implementation status

PaperSource is in **MVP implementation**. The customer-account milestone is complete on its feature branch and the next milestone is full RLS plus delivery/settings administration. The product specification is not an implementation phase tracker.

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

1. Delivery-zone CRUD; VAT, quote-expiry and WhatsApp settings; useful staff customer/organisation/payment/delivery reads. Full-table RLS policy hardening is complete on the customer-accounts feature branch.
2. Storefront delivery-zone copy and remaining Product JSON-LD; stabilize the full Playwright suite, including admin quote journeys.
3. Sentry and launch verification. Vercel Analytics is already present.
4. Optional: quote-expiring reminders at T-48h.

Reorder, credit ledgers, furniture, PostHog, search SaaS and a custom wordmark remain out of MVP. Feature-branch commits are not a claim of deployment or a merge into master.
