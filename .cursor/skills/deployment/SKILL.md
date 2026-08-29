---
name: deployment
description: Local, Vercel preview, production, and secrets. Use when configuring env, CI, or going live.
---

# Deployment

Read @docs/ARCHITECTURE.md (environments) and @docs/SECURITY.md (env).

## When to Use

- Env files, Vercel, CI, production cutover

## Instructions

1. Environments: PaperSource Local → Preview (Vercel) → Production (`papersourcegh.com`).
2. Never point local work at the production database or live Paystack without a written exception.
3. Public env only: `NEXT_PUBLIC_SITE_URL`, Supabase URL + publishable key, Paystack public key, Cloudinary cloud name.
4. Server-only: service role, `DATABASE_URL`, Paystack secret, Resend, Cloudinary secret, Sentry DSN.
5. Git: `main` + `feature/*` + `fix/*`. Preview every feature before production.
6. CI: lint, `tsc --noEmit`, Vitest, Playwright critical project.
7. Production launch (later phase): prod Supabase, Paystack, Resend domain, Cloudinary, backups, Sentry. Not required to finish this scaffold.
