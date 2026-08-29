---
name: papersource-architecture
description: PaperSource Next.js App Router architecture, feature folders, and locked stack. Use when scaffolding, adding routes, choosing libraries, or placing business logic.
---

# PaperSource architecture

Read @docs/ARCHITECTURE.md and @docs/PRODUCT.md.

## When to Use

- Adding routes, features, or packages
- Deciding Server vs Client Components
- Splitting cart vs quotations vs catalogue

## Instructions

1. Use Next.js 16 App Router, TypeScript strict, Tailwind 4, shadcn + Base UI, Drizzle, Supabase, Zod, pnpm.
2. Place routes in `src/app/(store|account|checkout|corporate)`, `src/app/admin`, `src/app/api`.
3. Domain logic in `src/features/{cart,checkout,catalogue,quotations,organisations,payments,inventory,delivery}`.
4. Integrations in `src/lib/{db,supabase,paystack,cloudinary,email}`.
5. Server Components by default. Server Actions for first-party mutations. Route handlers for Paystack webhook and uploads only.
6. One server price-resolution module. No duplicated pricing in UI.
7. Cart and quotations are separate features and tables.
8. Do not add Redux, GraphQL, Express, Firebase, Mongo, Shopify, Woo, or Algolia/Typesense.
9. Environments: Local → Vercel Preview → Production. Never build against the production database.
