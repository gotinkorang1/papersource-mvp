---
name: admin-dashboard
description: PaperSource /admin IA and RBAC. Use when building admin pages, staff roles, or operations UI.
---

# Admin dashboard

Read @docs/ADMIN.md.

## When to Use

- Any `/admin` route, staff nav, quote/order operations UI

## Instructions

1. Build `/admin` as the operating interface. Do not tell staff to use Supabase Studio for quotes or orders.
2. Nav: Dashboard, Commerce (orders, quotes, customers, orgs), Catalogue, Marketing, Operations, Website, System.
3. Roles: SUPER_ADMIN, ADMIN, SALES, WAREHOUSE, CONTENT_MANAGER in `admin_roles`.
4. SALES: full quotes (price, send, revise, terms). Cannot change system settings, roles, or delivery zone config.
5. WAREHOUSE: inventory and fulfilment. Cannot edit `price_tiers` or promotions.
6. CONTENT_MANAGER: product copy/media, pages, FAQs, banners. Cannot edit payments or quote totals.
7. Enforce the matrix on the server every request. Hidden links are not security.
8. Quote detail is the critical screen: lines, attachments (signed URLs), timeline, price, send, accept/terms.
9. Style as PaperSource (navy sidebar, cream/white, status chips) — not default shadcn dashboard purple.
