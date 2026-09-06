# Content management: pages, FAQs, and navigation

## Goal

Give authorised PaperSource staff a production-safe way to maintain public pages, frequently asked questions, and navigation without Supabase Studio or code changes. Existing hard-coded FAQ and navigation content remains a fallback until staff publish replacements.

## Scope

### Content pages

`content_pages` stores a stable slug, title, description, body, status (`draft` or `published`), and timestamps. Public routes render only published records. Staff can create, edit, publish, unpublish, and preview a page. Slugs are unique and validated as URL-safe lower-case paths.

### FAQs

`faqs` stores a question, answer, display position, and status. Public FAQ rendering uses published rows ordered by position, falling back to the current built-in FAQ set when no published rows exist. Published FAQs expose `FAQPage` JSON-LD only for the visible questions.

### Navigation

`navigation_items` stores label, href, placement (`header`, `footer`, or `mobile`), display position, and active state. Public navigation reads active rows ordered by position and falls back to the current code-defined links when no rows exist. External URLs are validated and opened safely.

## Authorisation and data safety

- Staff routes require the existing `requireStaffArea` guard.
- Content managers can manage pages, FAQs, and navigation; other roles follow the existing RBAC matrix.
- Public reads expose only published/active rows.
- RLS is enabled on every new table. Anonymous and authenticated users can select only public rows; staff mutations run through the existing server-side database path and audit logger.
- Service-role credentials remain server-only.

## UI and flow

- Add Pages, FAQs, and Navigation desks to the admin sidebar with responsive tables/forms.
- Each desk shows status, ordering, last update, and a clear publish/edit action.
- Include preview links to the public route and empty-state guidance.
- Preserve the existing dark/light admin styling and keyboard focus states.
- Public pages remain server-rendered and use canonical metadata.

## Validation and failure handling

- Zod validation for slugs, labels, URLs, positions, and content lengths.
- Duplicate slugs and invalid actions return an inline admin error without losing form context.
- Public reads catch an unavailable content table and use the existing fallback content.
- Publish/unpublish and delete actions record actor, resource, and action in `audit_logs`.

## Verification

- Unit tests for validation, ordering, publication filtering, and fallback behavior.
- TypeScript, ESLint, and production build.
- Authenticated admin smoke tests for create → preview → publish → public read.
- Anonymous smoke tests confirm drafts are not visible.
