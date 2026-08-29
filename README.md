# PaperSource

Ghana’s modern workplace supply partner. Next.js 16 foundation for a dual-path catalogue: **retail cart** and **quote basket**.

Product source of truth: [docs/PRODUCT.md](docs/PRODUCT.md).

## Stack (locked)

Next.js 16 App Router · TypeScript strict · Tailwind CSS 4.3 · shadcn/ui + Base UI · Drizzle · Supabase · Zod · pnpm

## Dual path

Retail: browse → cart → checkout → Paystack/MoMo → delivery  
Business: browse → quote basket → RFQ → review/price → accept → order → delivery

Cart and quote list are separate objects. Do not collapse them.

## Local

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

```bash
pnpm test
pnpm lint
pnpm exec tsc --noEmit
```

Catalogue pages (`/shop`, `/shop/[category]`, `/product/[slug]`, `/brands/[slug]`, `/search`) read the in-app seed until a dedicated PaperSource `DATABASE_URL` is connected. Do not apply `drizzle/0001_catalogue.sql` to an unrelated Supabase project.

Do not point `.env.local` at the production database.

## Cursor

Project rules: `.cursor/rules/`  
Skills: `.cursor/skills/`

## Specs

| Doc | Domain |
| --- | --- |
| [docs/PRODUCT.md](docs/PRODUCT.md) | Master product |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Stack and folders |
| [docs/DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md) | Visual system |
| [docs/DATABASE.md](docs/DATABASE.md) | Schema |
| [docs/SECURITY.md](docs/SECURITY.md) | RLS and secrets |
| [docs/ECOMMERCE.md](docs/ECOMMERCE.md) | Retail |
| [docs/RFQ.md](docs/RFQ.md) | Quotations |
| [docs/ADMIN.md](docs/ADMIN.md) | `/admin` |
| [docs/SEO.md](docs/SEO.md) | SEO |
| [docs/TESTING.md](docs/TESTING.md) | Tests |
