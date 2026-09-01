# PaperSource — Architecture

**Status:** MVP implementation architecture. Must not contradict [PRODUCT.md](PRODUCT.md).
**Purpose:** Lock the stack, folder map, rendering rules, environments, and non-stack.

---

## 1. Locked stack

| Area | Choice |
| --- | --- |
| Framework | Next.js 16.x (App Router). Prefer current 16.2+ when scaffolding. |
| Language | TypeScript, `strict` |
| Styling | Tailwind CSS 4.3 |
| UI primitives | shadcn/ui + Base UI (own the component source) |
| Icons | Lucide |
| Animation | Motion (sparingly) |
| Database | Supabase PostgreSQL |
| ORM | Drizzle |
| Auth | Supabase Auth |
| Validation | Zod at every trust boundary |
| Forms | React Hook Form where client UX needs it + Server Actions |
| Payments | Paystack (cards + Mobile Money) |
| Public media | Cloudinary + `next-cloudinary` |
| Private documents | Supabase Storage |
| Email | Resend + React Email |
| Hosting | Vercel |
| Monitoring | Sentry |
| Analytics (MVP) | Vercel Analytics |
| Unit tests | Vitest |
| Component tests | React Testing Library |
| E2E | Playwright |
| Package manager | pnpm |
| Repository | GitHub |

Use **Next.js App Router**, not a separate React frontend and Express backend.

PaperSource uses Supabase as PostgreSQL + Auth + Storage + RLS infrastructure. It is **not** a replacement for application architecture. Business logic lives in the Next.js app (`features/`, Server Actions, route handlers), typed through Drizzle.

```text
Supabase  →  PostgreSQL
                ↑
             Drizzle
                ↑
             Next.js
```

---

## 2. Why this shape

Next.js App Router gives PaperSource:

- Server Components by default
- Server Actions for mutations
- Image optimisation + Cloudinary
- Metadata, dynamic SEO, Product JSON-LD
- Caching and streaming
- Server-side authentication
- Product pages generated from the database
- Vercel preview → production
- Strong Cursor / coding-agent support

Do not split a BFF or microservice layer in MVP.

---

## 3. Suggested repository structure

```text
src/
├── app/
│   ├── (store)/          # homepage, shop, product, brands, search, marketing
│   ├── (account)/        # account, orders, quotes, addresses, organisation
│   ├── (checkout)/       # cart, checkout, order status
│   ├── (corporate)/      # business, schools, bulk-orders, quote basket, RFQ
│   ├── admin/            # PaperSource operations UI
│   └── api/              # webhooks (Paystack), signed uploads, cron
│
├── components/
│   ├── commerce/
│   ├── products/
│   ├── quotes/
│   ├── navigation/
│   ├── marketing/
│   └── ui/               # shadcn + PaperSource primitives
│
├── features/
│   ├── cart/
│   ├── checkout/
│   ├── catalogue/
│   ├── quotations/
│   ├── organisations/
│   ├── payments/
│   ├── inventory/
│   └── delivery/
│
├── lib/
│   ├── db/               # Drizzle schema, client, queries
│   ├── supabase/
│   ├── paystack/
│   ├── cloudinary/
│   └── email/
│
└── types/
```

Route groups match the sitemap in [PRODUCT.md](PRODUCT.md). Feature folders own domain logic. UI components do not query Paystack or recompute legal totals.

---

## 4. Rendering and data rules

| Rule | Decision |
| --- | --- |
| Default | React Server Components |
| Mutations | Server Actions or route handlers |
| Client components | Interaction only (drawers, quantity, forms that need RHF) |
| `useEffect` | Avoid for data fetching. Do not use as a default sync tool. |
| Business logic | Outside UI. `features/*` and `lib/*` |
| Validation | Zod at trust boundaries (forms, actions, webhooks) |
| Database access | Drizzle. No ad-hoc `any` SQL in components. |
| Pricing | Server-authoritative. One price-resolution module. No duplicated pricing logic. |
| Currency | Integer pesewas end to end |
| Auth | Supabase server client for RSC/actions. Never expose service role. |
| Admin routes | Server-side role check before render. Do not rely on hidden nav links. |

### Conceptual runtime

```text
                 papersourcegh.com
                         │
                    Next.js 16
                         │
         ┌───────────────┼──────────────┐
         │               │              │
     Storefront       Corporate       Admin
         │               │              │
       Cart         Quote Engine     Operations
         │               │              │
         └─────────── Application ───────┘
                         │
                    Drizzle ORM
                         │
                  Supabase/Postgres
                         │
       ┌─────────────────┼───────────────────┐
       │                 │                   │
    Paystack          Resend             Cloudinary
   Payments           Email                Media
         │
    MoMo / Card
```

---

## 5. Dual-path in the architecture

Cart and quotations are **different features** with different tables and different UI chrome.

| Feature folder | Owns |
| --- | --- |
| `features/cart` | Retail cart persistence, merge-on-login, line preview |
| `features/checkout` | Address, zone selection, order create, Paystack init |
| `features/quotations` | Quote basket, RFQ submit, status transitions, accept → order |
| `features/payments` | Paystack init, webhook, verify, idempotency |
| `features/delivery` | Zone engine, nationwide-request behaviour |
| `features/catalogue` | Products, variants, attributes, search, tiers (read) |
| `features/inventory` | Stock reads, movements (writes after payment/terms) |
| `features/organisations` | Org create-at-quote, membership |

A shared catalogue module feeds both paths. It must not import cart or quote UI.

---

## 6. API surface (MVP)

Prefer Server Actions for first-party mutations. Use route handlers when the caller is external or the platform requires HTTP:

| Handler | Why |
| --- | --- |
| `POST /api/paystack/webhook` | Paystack server-to-server. Signature verify. Idempotent. |
| Document upload endpoints | Multipart / signed upload to Supabase Storage |
| Optional cron | Quote expiry, abandoned-cart later (expiry is MVP for quotes) |

Do not add a public GraphQL API. Do not add a general-purpose REST resource API for the storefront in MVP.

---

## 7. Environments

```text
Local  →  Preview (Vercel)  →  Production
```

| Name | Use |
| --- | --- |
| PaperSource Local | Dev machine + local or dedicated non-prod Supabase |
| PaperSource Staging | Vercel preview or a stable staging project. Non-prod Paystack. |
| PaperSource Production | papersourcegh.com. Production Supabase, Paystack, Resend, Cloudinary |

Never build features directly against the production database.  
Never point local webhook experiments at production Paystack without a written exception.

Git (solo-friendly):

```text
main
feature/*
fix/*
```

Every feature should go through a Vercel Preview deployment before production.

---

## 8. Environment variables

Public (safe in the browser):

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

Never put secrets in `NEXT_PUBLIC_*` unless the vendor designed them to be public (publishable keys only).

Full secret-handling rules: [SECURITY.md](SECURITY.md).

---

## 9. Third-party responsibilities

| Vendor | Owns | Does not own |
| --- | --- | --- |
| Supabase | Postgres, Auth, Storage, RLS, backups | Product pricing rules, quote state machine |
| Paystack | Checkout UI, card/MoMo rails | Order fulfilment. Server must verify. |
| Cloudinary | Public image CDN and transforms | Private RFQs / POs |
| Resend | Transactional delivery | Business copy lives in React Email templates |
| Vercel | Hosting, analytics, previews | Source of truth for stock or payments |
| Sentry | Error telemetry | Not a substitute for payment idempotency logs |

---

## 10. Frontend libraries (keep the list short)

**Core:** `next`, `react`, `typescript`, `tailwindcss`  
**UI:** shadcn/ui, Base UI, `lucide-react`, `motion`  
**Forms:** `react-hook-form`, `zod`  
**Database:** `drizzle-orm`, `postgres`  
**Utils:** `date-fns`, `clsx`, `tailwind-merge`  
**Email:** `resend`, `react-email`  
**Images:** `cloudinary`, `next-cloudinary`

Do not install a library because an agent suggested it. Justify each addition against this list.

Do not install Redux. Server state + URL + small client store (cart/quote drawers) is enough.

---

## 11. Explicit non-stack

Do not introduce any of the following for this project:

| Avoid | Why |
| --- | --- |
| WordPress / WooCommerce | Custom RFQ and dual-path will fight the CMS |
| Firebase | Relational commerce (orders, variants, orgs, quotes) needs Postgres |
| MongoDB | Same |
| Redux | Unnecessary |
| Microservices | Unnecessary |
| Kubernetes | Unnecessary |
| GraphQL | Unnecessary in MVP |
| Elasticsearch / Algolia / Typesense | Start with Postgres FTS + `pg_trgm` |
| Shopify headless | Quotation/procurement will fight Shopify assumptions |
| Separate Express/Fastify API | App Router is the backend |

---

## 12. Tooling (humans, not runtime)

Development: Cursor, Git, GitHub, Node.js, pnpm, Docker Desktop, Supabase CLI, Vercel CLI, Playwright, Postman or Bruno, TablePlus or DBeaver.

Design: Figma, Coolors, Google Fonts, Lucide, Cloudinary.

Testing: Playwright, Lighthouse, axe, Vitest, RTL.

Management: GitHub Issues + GitHub Projects. No Jira required.

---

## 13. Cursor must / must not

**Must**

- Use App Router, TypeScript strict, feature folders, Drizzle, Zod.
- Keep cart and quotations as separate features.
- Put price resolution in one server module.
- Use Server Components by default.

**Must not**

- Scaffold Create React App, Remix, or a second backend.
- Add GraphQL, Redux, or a search SaaS in MVP.
- Fetch catalogues in `useEffect` as the default pattern.
- Duplicate Paystack or pricing logic in components.
- Treat Supabase Dashboard as the admin app.
