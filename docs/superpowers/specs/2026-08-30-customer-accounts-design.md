# Customer Accounts Design

**Status:** Approved design for the MVP customer-accounts slice

**Date:** 2026-08-30

**Product authority:** [`docs/PRODUCT.md`](../../PRODUCT.md) remains the source of truth.

## Purpose

Add the authenticated customer path without weakening the existing guest retail and RFQ paths. Customers receive account history, a Ghana address book, and one organisation workspace. Supabase Auth is the sole customer identity provider. Staff authentication remains the existing local-secret flow until a later staff-auth slice.

This design salvages the useful uncommitted account UI and domain work, removes its custom authentication system, and repairs the commerce ownership gaps discovered during the handoff audit.

## Goals

- Email/password registration, confirmation, sign-in, sign-out, forgotten-password, and password-reset flows through Supabase Auth.
- `/account`, `/account/orders`, `/account/quotes`, `/account/addresses`, and `/account/organisation` as protected customer routes.
- Ghana-first saved-address CRUD with exactly one optional default address per customer.
- One optional organisation workspace per customer for MVP, with ownership represented through `organization_members`.
- Authenticated checkout and RFQ submission associated with the verified profile and organisation where applicable.
- Safe guest-to-account commerce merging that preserves the retail-cart/quote-basket boundary.
- Account access to authorized orders and quotations, including orders created from accepted quotes.
- Local and automated auth testing against a Supabase development stack, not a second password database.
- Milestone commits pushed to a feature branch after verification.

## Non-goals

- Staff migration to Supabase Auth.
- Organisation invitations, member administration, or multiple organisations per customer.
- Reorder / Buy Again, credit ledgers, or procurement approval workflows.
- Full RLS policy coverage for every existing exposed table. That remains the next security-hardening slice, although tables introduced here have RLS enabled and the data model is compatible with ownership policies.
- Promotions, CMS content, custom wordmark work, PostHog, or search SaaS.

## Approaches considered

### Selected: salvage the WIP and replace the identity core

Keep the useful route, form, query, address, and organisation work. Remove `customer_credentials`, the `ps_customer` HMAC cookie, and the `AUTH_MODE` branch. Rework authorization around Supabase SSR cookies and verified claims, then repair ownership and merge behavior.

This preserves useful work while eliminating the unsafe split session.

### Rejected: rewrite the whole account slice

A clean rewrite would simplify reasoning but discard working UI and domain code. The existing WIP is small enough to review and correct in place.

### Rejected: retain a local password/session adapter

Maintaining a custom local password table and a separate production cookie creates two security models. It also allows an application cookie to outlive Supabase sign-out or revocation. Local development will use Supabase instead.

## Runtime and local development

- Keep `@supabase/ssr` and `@supabase/supabase-js` as the application auth libraries.
- Use Node.js 22 or newer; the current workstation uses Node.js 24.
- Use Supabase CLI `2.116.0` for this slice, invoked through a version-pinned project command when the installed global CLI does not match.
- Add a local Supabase project configuration on ports that do not disturb the existing `papersource-postgres` container on port `54329`.
- Preserve the existing standalone PostgreSQL volume. It is not deleted or migrated destructively.
- Point the application and migration scripts at the local Supabase PostgreSQL instance when exercising customer accounts.
- Keep secrets in `.env.local`; only publishable Supabase values use `NEXT_PUBLIC_*`.
- Continue to keep `SUPABASE_SERVICE_ROLE_KEY` server-only. Customer account reads and mutations do not use it.
- Continue using the existing Drizzle schema and `drizzle/*.sql` migration sequence. Do not introduce a second application schema history under `supabase/migrations`.

## Authentication architecture

### Supabase session is authoritative

`createSupabaseServerClient()` owns cookie-backed Supabase sessions. The customer data-access layer verifies identity with `supabase.auth.getClaims()` and uses the JWT subject as the customer profile ID. It never authorizes from `getSession()`, `user_metadata`, a client-provided profile ID, or an application-signed customer cookie.

`src/proxy.ts` composes two request-level responsibilities:

1. preserve the existing anonymous `ps_session` cookie used by guest commerce; and
2. refresh Supabase auth cookies when required.

Proxy checks are only an optimization. Every protected read and mutation verifies the customer again close to the data access.

### Customer actor

The customer data-access layer exposes a request-memoized actor with this shape:

```ts
type CustomerActor = {
  profileId: string;
  email: string;
  fullName: string;
  phone: string | null;
};
```

The actor is created only from verified Supabase claims plus the corresponding `profiles` row. A missing profile is repaired through a server-only profile synchronization operation using the verified subject and email. Email lookup never establishes identity.

### Registration and confirmation

Registration is a Server Action validated by Zod. It calls `supabase.auth.signUp()` with an allow-listed confirmation return URL.

- If the development Auth configuration returns an authenticated session immediately, profile synchronization and guest merge run before redirecting to `/account`.
- If confirmation is required, the page shows a neutral “check your email” result. It does not issue a parallel customer session.
- The confirmation handler verifies the Supabase token/code, synchronizes the profile, merges the current browser's guest commerce, and redirects to an allow-listed local destination.
- Registration and login errors avoid revealing whether an email is registered beyond what Supabase safely returns.

### Sign-in and sign-out

Sign-in is a Server Action using `signInWithPassword()`. On success it synchronizes the profile, merges current-browser guest commerce, and redirects outside error handling.

Sign-out calls `supabase.auth.signOut()`. The guest session cookie remains so the browser can start a new guest cart and quote basket, but repositories must never return profile-owned rows through only that guest cookie.

### Password reset

`/forgot-password` requests a Supabase reset email with an allow-listed callback. The callback verifies/exchanges the Auth token, and `/reset-password` updates the password through Supabase. No application password hash is stored.

### Safe redirects

Auth `next` parameters accept only local paths from an explicit allow-list. Absolute URLs, protocol-relative URLs, encoded external URLs, and admin destinations are rejected.

## Data model

### Profiles

`profiles.id` equals the verified Supabase Auth subject for customer rows. It is not given a database foreign key to `auth.users` in this slice because the same table currently contains seeded staff profiles used by the separate local staff-secret flow. Customer creation enforces the equality in server code. A future staff-auth migration can make every profile an Auth user and add the database constraint.

Add or retain a case-insensitive unique email index after confirming existing data has no duplicates. Profile display fields may be updated by their owner, but they never contain authorization roles.

### Remove custom credentials

The uncommitted `customer_credentials` table and its migration statements are removed. `CUSTOMER_SESSION_SECRET`, `AUTH_MODE`, password hashing helpers, and the `ps_customer` cookie are removed with them.

### Organisation membership

Retain `organization_members` with `owner | member` roles. Enforce one organisation membership per profile for MVP while allowing multiple profiles to belong to the same organisation. The first customer creating an organisation is its owner.

- Owners can edit organisation details.
- Members can view the organisation and organization-scoped commerce but cannot edit it.
- Invitations and member administration have no UI in this slice.
- RFQs submitted while signed in use the saved organisation only when the customer explicitly submits on its behalf; guest-first RFQ fields remain available.

Enable RLS on `organization_members`. Full policies land in the following RLS milestone.

### Addresses

Retain `addresses.owner_profile_id`, Ghana fields, `delivery_area`, and `is_default`.

- Every customer address mutation includes `owner_profile_id = actor.profileId` in its predicate.
- Setting one address as default clears the previous default in the same transaction.
- Deleting the default leaves no default rather than silently choosing another.
- Organisation-owned addresses remain distinct from personal addresses.
- A database partial unique index prevents more than one default personal address per profile.

### Commerce ownership constraints

Add these ownership constraints after a migration preflight confirms existing values resolve:

- `carts.profile_id`, `quotes.profile_id`, and `orders.profile_id` reference `profiles.id`.
- `quotes.organization_id` references `organizations.id`.
- `orders.organization_id` retains its organisation reference and `orders.quote_id` references `quotes.id`.
- `quotes.parent_quote_id` references `quotes.id`.
- Carts have indexed `profile_id`; quotes and orders have indexed `profile_id` and `organization_id`.

Make `carts.session_id` nullable for authenticated carts. Replace the global session uniqueness rule with two partial unique indexes: one profile cart per non-null `profile_id`, and one guest cart per non-null `session_id` where `profile_id is null`. Apply the same ownership model to draft quotations: one draft per profile and one guest draft per session, with submitted records excluded from those uniqueness predicates.

Quote-origin order creation copies both `profile_id` and `organization_id` from the accepted quotation. Retail checkout writes the verified `profile_id` when signed in.

## Guest commerce merge

Guest ownership is proven by the server-read HTTP-only `ps_session` cookie. Email equality alone never claims a quote or order.

The merge runs transactionally after confirmed registration or sign-in:

### Retail cart

1. Load the guest cart by `(session_id, profile_id is null)`.
2. Load or create the profile cart by `profile_id`.
3. Upsert each guest line into the profile cart, summing quantities by variant.
4. Delete the merged guest cart.
5. Retain exactly one profile cart.

### Quote basket

1. Load the guest draft quote by `(session_id, profile_id is null, status = draft)`.
2. Load or create the profile draft quote by `(profile_id, status = draft)`.
3. Upsert guest lines into the profile draft, summing quantities by variant while retaining quote snapshots.
4. Delete the merged guest draft.
5. Retain exactly one profile draft quote.

Cart and quote operations occur independently. A cart merge never reads or writes quote lines, and a quote merge never reads or writes cart lines.

### Submitted records from the current browser

Submitted quotes and orders carrying the current guest `session_id` may receive the verified `profile_id`. Their existing organisation link and secret access token remain intact. Records from another browser are not claimed by matching email. They remain accessible through their emailed secret token unless a later explicit claim flow is designed.

### Signed-in repository lookup

Cart and quote repositories accept an actor-aware commerce identity. When authenticated they query by `profile_id`; otherwise they query only guest rows with `profile_id is null` and the current `session_id`. This prevents logout from exposing a profile cart through a stale guest cookie and allows an account cart or quote basket to follow the customer across browsers.

## Account surfaces

### Navigation

- Desktop header shows “Sign in” or the customer's display name.
- Mobile gets an account affordance in the header/menu without replacing the locked Home / Shop / Search / Quote / Cart bottom navigation.
- Footer retains sign-in/account access as a fallback.

### `/account`

Overview shows identity, organisation state, address count, and recent order/quote summaries. It provides direct links to each account section and sign-out.

### `/account/orders`

Lists orders owned by the profile or an organisation of which the actor is a member. Order detail authorizes by profile, organisation membership, or the existing guest session capability. It never relies only on a human-readable order number.

### `/account/quotes`

Lists quotations owned by the profile or authorized organisation. Guest secret-token URLs continue to work. Account reads never list another customer's quote based only on email.

### `/account/addresses`

Lists, adds, edits, removes, and marks default Ghana addresses. Forms use the existing Ghana address schema and components. Checkout prefills the default address but allows per-order edits without mutating the saved address implicitly.

### `/account/organisation`

Creates or displays the customer's one organisation. Owners can edit it; members see a read-only view. Organisation type is validated against the database enum rather than cast from arbitrary form text.

### Checkout and RFQ integration

- Signed-in checkout prefills email and default address, then writes `orders.profile_id`.
- Signed-in RFQ prefills contact and organisation details while allowing deliberate edits for the current request.
- RFQ submission writes `quotes.profile_id` and the selected authorized `organization_id`.
- Guest checkout and guest RFQ retain their current behavior.

## Security boundaries

- Add `server-only` to customer auth, session, and data-access modules.
- Verify Supabase claims in every customer mutation and sensitive read.
- Do not authorize from `user_metadata`; it is display input only.
- Keep service-role imports outside customer modules and Client Components.
- Do not include raw access tokens, refresh tokens, document paths, or webhook payloads in account DTOs.
- Protect account mutations against object-level authorization failures with ownership predicates in the database query.
- Enable RLS on new exposed tables even before the full policy milestone.
- Preserve signed document URLs and existing guest quote tokens; do not make private Storage public.
- Treat Server Actions and Route Handlers as public endpoints and validate all form data with Zod.
- Keep account responses private and dynamic; do not cache them as shared public data.

## Error handling and UX

- Form validation errors are associated with their fields and announced accessibly.
- Expected auth failures return neutral form state; unexpected failures are safe for future Sentry capture without secrets.
- Navigation redirects occur outside `try/catch` blocks.
- Protected pages redirect unauthenticated customers to `/login` with a safe local return destination.
- Confirmation/reset links that are invalid or expired show a recoverable explanation and a way to request a new email.
- Empty account histories provide links back to Shop or Quick Order.

## Testing strategy

All new or corrected behavior follows red-green-refactor. Existing WIP is preserved, but each behavior changed during salvage receives a failing regression test before its production edit.

### Unit and integration tests

- Safe auth return-path parsing.
- Verified-claims-to-profile actor construction; invalid or missing claims are rejected.
- Organisation type validation and owner/member edit authorization.
- Default-address transaction behavior and cross-profile mutation rejection.
- Guest cart merge sums duplicate variants and does not touch quote lines.
- Guest quote merge sums duplicate variants and does not touch cart lines.
- Email-only records are not claimed.
- Quote acceptance copies profile and organisation into the order.
- Account history is profile/organisation scoped.

### Component tests

- Login, register, forgotten-password, and reset forms expose labels, autocomplete attributes, pending state, and accessible errors.
- Address add/edit/default UI uses Ghana fields and no required postal code.
- Account navigation and mobile account affordance remain keyboard accessible.

### Playwright journeys

- Register, confirm as configured, reach `/account`, and sign out.
- Sign in and reject unauthenticated access after sign-out.
- Add separate guest cart and quote lines, sign in, and verify both merge independently.
- Save a default address and see checkout prefilled.
- Create an organisation, submit an RFQ on its behalf, and see it in quote history.
- Complete a retail checkout and see the order in account history.
- Accept a profile-owned quote and open the resulting order from account history.
- Verify another account cannot read or mutate the first account's address, order, quote, or organisation.
- Exercise desktop and mobile layouts and check the browser console.

Tests use local or dedicated non-production Supabase Auth. Production credentials and Paystack live keys are forbidden.

## Delivery milestones and Git strategy

Work occurs on `codex/mvp-customer-accounts`. Each milestone is reviewed, freshly verified, committed, and pushed before the next milestone begins.

1. **Quick Order and office packs:** isolate the existing non-account WIP, apply the current migration/seed prerequisites, verify unit and Playwright coverage, then commit and push.
2. **Supabase Auth foundation:** local Supabase configuration, canonical SSR session/claim verification, registration/confirmation/login/logout/reset flows, corrected account migration, and auth tests.
3. **Customer ownership and commerce integration:** actor-scoped DAL, address/organisation authorization, transactional dual-path guest merge, profile-aware repositories, checkout/RFQ/order linkage, and tests.
4. **Account experience and verification:** finish account surfaces and navigation, complete Playwright journeys, run lint/typecheck/unit/E2E/build/browser checks, then commit and push.

The branch is merged only after final verification. Existing user-authored WIP is never reset or discarded to split commits; partial staging or small reviewed edits isolate milestones safely.

## Acceptance criteria

- Supabase Auth is the only customer credential and session system.
- Supabase sign-out immediately removes account access; no parallel customer cookie remains.
- Confirmation and password-reset flows are functional in the configured Auth environment.
- Guest checkout and RFQ still work without an account.
- Login preserves independent cart and quote baskets and supports subsequent cross-browser account access.
- No quote or order is claimed solely by matching email.
- Account order and quote history cannot expose another profile's or organisation's data.
- Saved Ghana addresses support add, edit, remove, default, and checkout prefill.
- A customer can create/view one organisation and submit an RFQ on its behalf.
- Quote-origin orders retain customer and organisation ownership.
- Staff local-secret authentication is unchanged.
- New exposed tables have RLS enabled; service role remains server-only.
- Relevant unit, component, Playwright, typecheck, lint, build, mobile, desktop, and console checks pass with fresh evidence.
- Every delivery milestone is committed and pushed to the feature branch.

## Deferred sequence after accounts

After this slice, follow the user-approved order: complete RLS policies and security advisors, add delivery-zone/settings admin plus customer/organisation/payment/delivery reads, polish zone-driven storefront copy and Product JSON-LD while stabilizing Playwright, then add Sentry. Quote-expiring email remains optional after those MVP priorities.
