# PaperSource Modern Stationery Platform Capability Audit

Date: 2026-09-17

## Summary

PaperSource already has a strong commerce foundation for a Ghanaian stationery business: separate retail and quote purchase paths, product taxonomy, brands, catalogue search, customer accounts, organisation flows, delivery zones, Paystack integration, product reviews, email notifications, inventory movements, and a role-aware admin console.

The next work should focus on closing the highest-impact gaps for retail retention, B2B procurement, schools, corporate accounts, and operations. The audit deliberately avoids adding features that duplicate working flows or change the server-authoritative money and permission model.

## Capability matrix

| Capability | Current state | Evidence | Priority |
| --- | --- | --- | --- |
| Retail cart | Present | Cart components and checkout routes | Maintain |
| Separate quote basket | Present | Quote basket, RFQ, quote status routes | Maintain |
| Paystack payments | Present | Paystack button, webhook, payment schema | Maintain and harden |
| Ghana cedi and VAT-safe money | Present | Integer pesewa money utilities and product rules | Maintain |
| Accra, Tema, nationwide delivery | Present | Delivery zones, delivery badges, order delivery fields | Maintain and expand |
| Product catalogue, variants, brands, categories | Present | Catalogue queries, admin product/taxonomy screens | Maintain |
| Product aliases and attribute search | Present | Product aliases, attributes, search matcher | Improve database scalability |
| Product images and crop/reorder tools | Present | Product image manager and saved image editor | Maintain |
| Product bundles/kits | Partial | Bundle product type and bundle item admin functions | Add storefront merchandising and stock semantics |
| Catalogue filters and pagination | Present | Shop, category, brand, search routes | Add better filter persistence and backend pagination |
| Product reviews | Present | Product review schema, product engagement, admin moderation | Add customer prompts and moderation reporting |
| Search suggestions/autocomplete | Present | API search suggestions and header search | Add debounce, observability, and query limits |
| Wishlist | Missing | No wishlist route, schema, or feature found | High |
| Recently viewed products | Missing | No persistent recently-viewed feature found | Medium |
| Saved carts and reorder | Missing | Account orders exist, but no saved cart/reorder workflow found | High |
| Guest checkout | Partial | Checkout exists; verify guest, recovery, and abandoned-cart behavior | High |
| Customer notifications centre | Missing | Email events exist, but no in-app notification centre found | Medium |
| Returns workflow | Partial | Returns content route exists, but no customer/admin case workflow found | High |
| Customer support notes | Missing | No clear support case or order-note workflow found | Medium |
| Organisation accounts | Present | Organisation/account routes and admin organisation screens | Maintain |
| Multiple organisation users and roles | Partial | Staff RBAC exists; organisation workflow needs capability verification | High |
| B2B quote flow | Present | RFQ, quote pricing, expiry, acceptance, and order conversion | Maintain and improve |
| Quick order by SKU | Present | Quick-order page and add route | Add CSV/spreadsheet import |
| Bulk ordering | Present | Bulk-orders and request-quote routes | Add saved lists and approval controls |
| Purchase orders and invoicing | Partial | Order/payment records exist; PO/invoice workflow needs verification | High |
| Contract pricing and customer-specific pricing | Partial | Price tiers exist; no clear organisation-specific price book found | High |
| Approval workflows | Missing | No organisation purchase approval model found | High |
| Recurring orders | Missing | No subscription/replenishment workflow found | Medium |
| School supply lists | Partial | Schools route exists; no saved term/classroom list workflow found | High |
| Corporate procurement lists | Missing | No reusable procurement-list model found | High |
| Inventory movements | Present | Inventory schema and admin adjustment workflows | Maintain |
| Low-stock status | Present | Stock level calculation and admin status badges | Add alerts and dashboards |
| Reservations/backorders/substitutions | Partial | Stock/reserved values exist; no complete customer workflow found | High |
| Delivery fulfilment operations | Present | Admin delivery/order areas exist | Add tracking events and customer visibility |
| Email notifications | Present | Transactional email templates and idempotent sending | Add delivery/return/account events |
| WhatsApp notifications | Missing | Product sharing exists, transactional WhatsApp workflow not found | Medium |
| Product import/export | Partial | Catalogue scripts exist; admin import/export UX needs verification | High |
| Duplicate detection | Partial | Brand/product dedupe fixes exist; import-time duplicate review needs strengthening | High |
| Sales and inventory reporting | Missing/partial | Dashboard has operational counts; deeper reporting not evident | Medium |
| SEO metadata and structured data | Present | Metadata, sitemap, robots, JSON-LD helpers | Maintain |
| PWA/mobile experience | Partial | Manifest and PWA components exist | Add offline-safe shell and install polish |
| Accessibility and responsive behavior | Partial | Focus states, responsive tables, mobile navigation, tests exist | Continuous |
| Audit logs and staff permissions | Present | Audit schema, logs route, RBAC matrix | Maintain and expand coverage |
| Rate limiting and abuse controls | Partial | Input validation and origin checks exist; broad request limiting not evident | High |
| Observability | Present | Sentry integration and health endpoint exist | Add business-event dashboards |
| Backups and recovery | Not verified | No repository evidence of operational backup policy | High operational review |

## Recommended delivery order

### Phase A: Revenue and retention

1. Wishlist and saved procurement lists.
2. Reorder from previous retail and organisation orders.
3. Guest checkout recovery and abandoned-cart handling.
4. Better search suggestions and product discovery analytics.

### Phase B: B2B, schools, and corporate procurement

1. Organisation members, roles, approval limits, and approval history.
2. Customer-specific price books and contract pricing.
3. PO terms, invoices, downloadable documents, and payment status.
4. School term lists, classroom/department budgets, and scheduled deliveries.
5. CSV/SKU bulk ordering and reusable procurement lists.

### Phase C: Operations and fulfilment

1. Low-stock and backorder alerts.
2. Delivery tracking events and customer visibility.
3. Returns/support cases with staff notes and status transitions.
4. Product import/export review tools and stronger duplicate detection.
5. Operational reporting for sales, inventory, quotes, fulfilment, and margins.

### Phase D: Platform hardening

1. Rate limits for public search, auth, quote, and mutation endpoints.
2. Sentry business-event instrumentation and actionable dashboards.
3. Backup/recovery verification and documented restoration procedures.
4. Accessibility and responsive browser regression coverage.
5. PWA install/offline shell improvements where they provide measurable value.

## Constraints for all future work

- Preserve separate retail-cart and quote-basket semantics.
- Keep money as server-authoritative integer pesewas and VAT-inclusive.
- Keep authorization on the server and preserve existing staff RBAC.
- Do not invent product metadata, especially authors for non-book stationery.
- Prefer shared components and shared backend contracts over route-specific patches.
- Every new mutation needs validation, idempotency where applicable, auditability, and focused tests.
- Do not claim production readiness without build, workflow, and deployment verification.

