---
name: supabase-security
description: Supabase Auth, RLS, service role, admin roles, and private storage. Use when writing schema, policies, auth, or uploads.
---

# Supabase security

Read @docs/SECURITY.md.

## When to Use

- Schema, RLS, Auth, admin gates, document uploads

## Instructions

1. Enable RLS on every exposed table. Authenticated ≠ authorized.
2. Staff roles in `admin_roles` only. Never authorize from `user_metadata`.
3. Service role is server-only. Never `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`.
4. Guest cart/quote access goes through Server Actions and httpOnly cookies or unguessable tokens — not client filters on `session_id`.
5. Catalogue writes are staff-only. Public select of active products only.
6. Orders and payments: no client insert/update of status or totals.
7. Private bucket for RFQs/POs. Server-generated paths. Signed URLs after authz. Restrict MIME and size.
8. `/admin/**` checks session + role on the server before render.
9. Helper `is_staff()` must read `admin_roles`, not JWT user metadata.
