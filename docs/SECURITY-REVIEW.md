# Production security review

**Reviewed:** 6 September 2026  
**Project:** PaperSource Supabase production database

## Verified

- Every public table has Row Level Security enabled.
- Catalogue and delivery tables expose read-only access to `anon` and `authenticated` where required by the storefront.
- Customer, organisation, order, quote, and address access is restricted to authenticated ownership or membership policies.
- Service-only tables (payments, payment events, inventory, inventory movements, document counters, uploaded documents, store settings, admin roles, and audit logs) have no `anon` or `authenticated` table grants.
- `audit_logs` exists, has indexes, has RLS enabled, and has no public grants.
- Server-side service credentials are not used in client components or `NEXT_PUBLIC_*` variables.

## Remaining verification

- Run the Supabase Security Advisor after the MCP advisor endpoint is available again.
- Recheck Vercel production environment variable scopes after the next deployment.
- Rotate any credentials that were previously pasted into chat or local shell history.

## Operational rule

Apply schema changes through reviewed migrations. Do not grant public access to service-only tables; the application server uses the server-side database connection for staff operations.
