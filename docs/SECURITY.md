# PaperSource — Security

**Status:** Phase 0. Must not contradict [PRODUCT.md](PRODUCT.md).  
**Purpose:** Authorization, RLS, secrets, payments, and private documents.  
Supabase is infrastructure. **Authenticated ≠ authorized.**

---

## 1. Principles

1. Every table the client can reach has **RLS enabled**.
2. Never treat “logged in” as permission to read or write arbitrary rows.
3. Never trust user-editable metadata (`user_metadata`) for admin or role checks.
4. Staff roles live in `admin_roles` (database) and may be mirrored to Auth **app_metadata by a server process only**.
5. The Supabase **service role key** is server-only. It never ships to the browser, never goes in `NEXT_PUBLIC_*`, never lands in client bundles.
6. Pricing, payment success, and inventory writes are **server-authoritative**.
7. Private files use **signed URLs** after an authorization check. Public product images go through Cloudinary, not a public RFQ bucket.
8. Validate every Storage path. Do not trust client-supplied paths blindly.
9. Admin UI routes check role **on the server** before rendering data. Hidden links are not security.
10. Webhooks verify signatures. Handlers are idempotent.

---

## 2. Auth

| Item | Decision |
| --- | --- |
| Provider | Supabase Auth |
| Storefront | Email/password (MVP). Optional later: magic link |
| Guest commerce | Cart via `session_id` cookie. RFQ via guest contact fields. Checkout without account allowed |
| Session | Server Supabase client in RSC / Server Actions / route handlers |
| JWT | Do not put roles in a client-writable claim |

On login, merge guest cart by `session_id` into the profile cart. Quote drafts: attach `profile_id` when the same browser session submits after signup, or keep guest quotes reachable by email + secret token.

### Quote access for guests

Submitted guest quotes are reachable at `/quote/[id]` only with a **unguessable token** (in the email link) or matching authenticated email. Do not list all quotes to any authenticated user.

---

## 3. Role storage

| Store | Allowed use |
| --- | --- |
| `admin_roles` table | Source of truth for staff |
| Auth `app_metadata.role` | Optional cache, written only with service role on the server |
| `user_metadata` | Display name, phone — **never** authorization |
| Profile columns | No `is_admin` boolean the user can update |

Organisation membership (`organization_members`) authorizes quoting/ordering **for that org**, not admin.

---

## 4. RLS policy sketch

Enable RLS on every public table. Service role bypasses RLS — use it only in trusted server code (webhooks, admin mutations that already passed Next.js RBAC).

### profiles

- Select: own row.
- Update: own row, restricted columns (not role).
- Staff: select/update per [ADMIN.md](ADMIN.md) via service role after Next.js check, or a `is_staff()` policy.

### organizations / organization_members

- Members can select their organisation.
- Insert: authenticated create, or server insert on guest RFQ.
- Guest RFQ org insert: **Server Action only** (user JWT may be anon). Anon should not have a wide `INSERT` on `organizations`. Prefer server + service role after Zod validation.

### addresses

- Owner profile can CRUD own addresses.
- Org members can use org addresses.
- Staff as above.

### Catalogue (categories, brands, products, variants, images, attributes, aliases, price_tiers)

- Anon + authenticated: `SELECT` where `active` / product `status = active`.
- Writes: staff only (server or `is_staff()` + role check). Never allow public insert/update.

### inventory / inventory_movements

- Public: no direct select of movements. Stock **display** via a safe view or product payload computed on the server (avoid leaking exact warehouse strategy if desired; showing in-stock/low/out is fine).
- Writes: warehouse/admin via server only.

### carts / cart_items

- Select/update/delete: `profile_id = auth.uid()` OR valid guest `session_id` **cannot** be expressed safely as “client sends session_id” without spoofing.
- **Guest carts:** prefer server actions that bind `session_id` from an httpOnly cookie, using service role or a locked RPC. Do not let the client query `carts` with an arbitrary session_id in a filter.
- Authenticated carts: RLS `profile_id = auth.uid()`.

### quotes / quote_items / quote_events

- Authenticated: select own `profile_id` or org membership.
- Guest: no open SELECT. Access through server with token.
- Insert/update status: customers may insert `draft` / submit via Server Action; status transitions after `submitted` are staff/system only.
- Anon must not `UPDATE` quotes to `paid` or `accepted` without the accept action’s checks.

### orders / order_items

- Select: owner profile, org member, or guest token on server.
- Insert: server only (checkout / quote conversion).
- No client update of `status` or totals.

### payments / payment_events

- No client write. Server + webhook only.
- Customer may select own payment **status** (not raw webhook payloads) if needed.

### delivery_zones

- Public select `active = true`.
- Writes: admin/settings.

### uploaded_documents

- No public select of `path`.
- Metadata select: owner, org member, or staff.
- Uploads via server that writes to a UUID path prefix: `{quote_id}/{uuid}-{filename}`.

### discounts, enquiries, reviews, wishlists, notifications, audit_logs

- Reviews/wishlists: own write; public read for published reviews only if UI exists.
- `audit_logs`: staff select, system insert only.
- Enquiries: insert via server (rate limit).

Helper SQL idea (illustrative):

```sql
create function public.is_staff()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.admin_roles
    where profile_id = auth.uid()
  );
$$;
```

Do not implement `is_staff()` by reading `auth.jwt() -> user_metadata`.

---

## 5. Admin route authorization

For every `/admin/**` request:

1. Require session.
2. Load `admin_roles` (or verified app_metadata).
3. Compare to the RBAC matrix in [ADMIN.md](ADMIN.md).
4. Deny with 404 or 403 (prefer 404 for unauthenticated to reduce probing; 403 for authenticated non-staff).
5. Then load data. Prefer Drizzle with the user-scoped client where RLS is enough; use service role only after the role check for operations RLS cannot express cleanly.

WAREHOUSE must not update `price_tiers`. SALES must not update system settings or `admin_roles`. CONTENT_MANAGER must not update payments.

---

## 6. Storage

| Bucket | Visibility | Contents |
| --- | --- | --- |
| Cloudinary | Public CDN | Product and brand imagery |
| Supabase `documents` | Private | RFQs, POs, procurement spreadsheets, invoices, internal |

Rules:

- Allowed MIME: PDF, Excel (`xlsx`), Word (`docx`), images (`jpeg`, `png`, `webp`). Reject others.
- Size cap (recommended): 15 MB per file unless admin raises it.
- Path: server-generated. Validate `quote_id` ownership before attach.
- Download: create a **short-lived signed URL** after authz. Do not set the documents bucket public.
- Never store service-role-signed URLs in HTML that is cached publicly.

---

## 7. Payments

| Rule | Detail |
| --- | --- |
| Init | Server creates order + payment row, then calls Paystack Initialize with **server-computed** `grand_total` (pesewas → kobo/amount as Paystack requires). |
| Success URL | Thank-you page may show “processing.” It must **not** set `paid`. |
| Query params | `if (url.includes("success")) order.paid = true` is forbidden. |
| Webhook | Verify Paystack signature. Persist `provider_event_id`. Replay = no-op. |
| Verify | After webhook (and on return URL as a secondary check), call Paystack verify. Amount and reference must match the payment row. |
| MoMo | Asynchronous. Final state from webhook/verify only. |
| Fulfilment | Only after `payments.status = success` or admin marks bank/PO/invoice terms **and** records that event. |

Idempotency: unique `paystack_reference`; unique `payment_events.provider_event_id`.

Details: [ECOMMERCE.md](ECOMMERCE.md).

---

## 8. Environment and secrets

Public:

```text
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
```

Server-only:

```text
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL
PAYSTACK_SECRET_KEY
RESEND_API_KEY
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
SENTRY_DSN
```

- Production secrets in Vercel encrypted env, not git.
- Local `.env` is gitignored.
- Rotate service role and Paystack secret if they leak into a client bundle or chat log.
- DATABASE_URL for Drizzle migrations: server/CI only.

---

## 9. Web and application hardening

- Zod (or equivalent) on all Server Actions and webhooks.
- Rate-limit RFQ submit, contact, checkout init, login (edge or middleware + provider tools).
- CSRF: Server Actions same-origin; webhooks use signature not cookie auth.
- File upload virus scanning is out of MVP; still restrict MIME/size and staff-only preview.
- Do not log full card data, full Paystack secrets, or raw national IDs. Redact tokens in Sentry.
- Audit log: quote price changes, role changes, inventory adjustments, payment status overrides.

---

## 10. Cursor must / must not

**Must**

- Enable RLS on every exposed table.
- Authorize admin on the server via `admin_roles`.
- Keep the service role on the server.
- Verify Paystack; persist external IDs; write idempotent webhooks.
- Use signed URLs for private documents.
- Validate storage paths and MIME types.

**Must not**

- Trust `user_metadata` for roles.
- Expose `SUPABASE_SERVICE_ROLE_KEY` to the client.
- Mark orders paid from the thank-you URL.
- Make the documents bucket public.
- Skip RLS because “it’s only the authenticated API.”
- Let SALES or WAREHOUSE through Next.js into out-of-scope tables without a policy.
