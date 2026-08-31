# Quick Order and Office Packs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Verify and ship the existing Quick Order and office-pack work before replacing customer authentication.

**Architecture:** Keep retail cart and quote repositories separate. Quick Order normalizes SKU rows and dispatches each valid line to the selected repository. Office packs receive seeded component rows; expanding pack purchases into component inventory is outside this seed-only milestone.

**Tech Stack:** Next.js 16.3.3, React 19, TypeScript, Drizzle/PostgreSQL, Vitest, Playwright, pnpm.

**Spec:** `docs/superpowers/specs/2026-08-30-customer-accounts-design.md`, delivery milestone 1. Remaining account milestones receive their own execution plan; this independent deliverable does not introduce Auth.

## Global Constraints

- Work occurs on `codex/mvp-customer-accounts`. Each milestone is reviewed, freshly verified, committed, and pushed before the next milestone begins.
- Existing user-authored WIP is never reset or discarded to split commits; partial staging or small reviewed edits isolate milestones safely.
- Preserve the existing standalone PostgreSQL volume. It is not deleted or migrated destructively.
- Tests use local or dedicated non-production Supabase Auth. Production credentials and Paystack live keys are forbidden.
- Project authority: retail cart and quote basket remain separate; money is integer pesewas; prices are VAT-inclusive and server-authoritative.

## File boundaries

- `src/features/quotations/quick-order.ts` and `.test.ts`: form parsing, duplicate normalization, quantity bounds.
- `src/features/quotations/apply-quick-order.ts`: catalogue resolution and destination-specific persistence.
- `src/features/catalogue/variant-context.ts`: SKU/barcode resolution.
- `src/app/quick-order/add/route.ts`: POST, guest cookie, redirect feedback.
- `src/app/(corporate)/quick-order/page.tsx`, `src/components/quotes/quick-order-form.tsx`: entry page and accessible form.
- `src/app/(checkout)/cart/page.tsx`, `src/app/(corporate)/quote/page.tsx`: redirect notices.
- `src/app/(corporate)/business/page.tsx`, `bulk-orders/page.tsx`, `schools/page.tsx`: existing corporate content and office-pack links. `corporate-accounts/page.tsx` stays with account WIP because it links to registration.
- `src/proxy.ts`: let the Quick Order POST handler validate Origin before creating a guest cookie.
- `src/components/navigation/store-header.tsx`, `store-footer.tsx`, `src/components/quotes/quote-basket.tsx`: discovery links. Stage only the Quick Order header hunk, leaving AccountLink WIP untouched.
- `scripts/seed-catalogue.ts`: deterministic contents for three office packs.
- `e2e/quick-order.spec.ts`: actual browser persistence, dual-path isolation, bundle content and mobile checks.
- `docs/TESTING.md`: verified commands and milestone notes.

## Task 1: Reject overflowing duplicate SKU totals

**Interfaces:** `parseQuickOrderForm(formData: FormData): ParsedQuickOrder`, where `ParsedQuickOrder = { rows: { sku: string; quantity: number }[]; invalid: string[] }`. No signature changes.

- [x] Add a failing regression to `quick-order.test.ts` using its existing `form` helper:

```ts
it("rejects the entire SKU when duplicate quantities exceed the limit", () => {
  const parsed = parseQuickOrderForm(form([
    ["DA-A4-80-500", "9999"],
    ["da-a4-80-500", "1"],
    ["HP-305-BLK", "2"],
  ]));
  expect(parsed.rows).toEqual([{ sku: "HP-305-BLK", quantity: 2 }]);
  expect(parsed.invalid).toHaveLength(1);
});
```

- [x] Observe the overflow SKU incorrectly returned. The forks worker failed to start, so the same assertion was executed directly against the TypeScript module with Node 24 and failed with the unwanted quantity 10000.
- [x] After the parsing loop, remove overflow entries and return a visible per-SKU error:

```ts
for (const [sku, quantity] of merged) {
  if (quantity > 9_999) {
    merged.delete(sku);
    invalid.push(`${sku} needs a combined quantity between 1 and 9999.`);
  }
}
```

- [x] Cover exactly 9999, three duplicate rows, fractional/negative quantities, blank rows and valid rows mixed with invalid ones. Verified with `pnpm exec vitest run src/features/quotations/quick-order.test.ts --pool=threads --maxWorkers=1 --environment=node`: 1 file, 11 tests passed. The direct Node regression also passed after the fix.

## Task 2: Verify the existing browser journeys and office-pack seed

**Interfaces:** `applyQuickOrderLines({ sessionId: string, destination: "quote" | "cart", rows: QuickOrderRow[] }): Promise<{ added: number; unknown: string[]; cartBlocked: string[] }>`. Bundle definitions remain editable in the existing catalogue admin; this task adds no new bundle-purchase behavior.

- [x] Inspect seed writes and local database readiness. All seven expected bundle rows were already seeded, so verified them with SQL instead of rewriting catalogue data. No account migration or volume reset was needed.
- [x] Retain the quote-only E2E and add the reverse-path assertion after a cart submission:

```ts
await page.goto("/quick-order");
await page.getByLabel("SKU 1", { exact: true }).fill("DA-A4-80-500");
await page.getByLabel("Quantity 1", { exact: true }).fill("2");
await page.getByRole("button", { name: "Add all to Cart" }).click();
await expect(page.getByRole("button", { name: "Cart, 2 items" }).first()).toBeVisible();
await expect(page.getByRole("button", { name: "Quote list, 0 items" }).first()).toBeVisible();
```

- [x] Add browser cases for unknown SKU and overflow feedback, empty submission, and request-quote-only quantities rejected from cart. Verify the small-office pack has the three expected component rows (paper 10, pens 2, files 4) with a database read. Use labels/roles and literal seeded quantities; no fixed sleeps. Existing OfficeBundleCard buttons are unwired; do not represent them as verified purchasing behavior.
- [x] Exercise Quick Order at 390x844 and desktop widths. Collect `pageerror` and console errors and assert none. Check for horizontal page overflow.
- [x] Run `pnpm exec playwright test e2e/quick-order.spec.ts --workers=1`: nine tests passed. Red/green regressions also fixed cart partial-success notice omission, cumulative quantity pricing, and cross-site POST guest-cookie replacement.

## Task 3: Isolate, verify, commit and push

**Interfaces:** Produces a self-contained feature commit on the existing branch; account WIP stays unstaged.

- [x] Review every selected diff. Stage the exact file boundaries above, excluding all account implementation and migration files. For the mixed header, apply a zero-context patch to the index containing only the Quick Order navigation addition (`git apply --cached --unidiff-zero`); never reset the working file. Independent review cleared the corrected implementation.
- [x] Run typecheck, lint and tests. Fresh typecheck and changed-file lint passed. Full lint had zero errors and one pre-existing warning. The default Vitest invocation stalled; separate Node-domain and jsdom-component runs covered all 24 current test files: 84 tests passed. Exact commands are in `docs/TESTING.md`.
- [x] Verify the staged tree does not import untracked account files. Inspect `git diff --cached --name-only` and `git diff --cached --check`.
- [x] Document fresh results in `docs/TESTING.md` and mark this plan's completed checkboxes.
- [x] Commit with `git commit -m "feat: add Quick Order and office-pack bundles"`, then `git push origin codex/mvp-customer-accounts`. Published feature commit: `eee9a5c`.
- [x] Confirm local and remote feature commit equality and report remaining account WIP separately. Account routes, authentication, schema/migration and checkout/RFQ ownership changes remain outside this milestone.

## Self-review

This plan covers only the independently shippable first milestone: parser, catalogue dispatch, both paths, office packs, navigation, tests and Git isolation. Supabase Auth, ownership/merge, account UI and final MVP checks remain required by the parent spec and are not represented as complete here. Existing interfaces are retained. No custom customer-auth files enter this milestone.

## Execution checkpoint: 2026-08-30

Task 1 is verified and can be committed independently with this plan and the parent spec's `ps_sid` typo correction. This is not completion of the Quick Order feature milestone. Task 2 is blocked by local infrastructure: Docker Linux engine returns HTTP 500, a direct PostgreSQL `select 1` on the expected local port 54329 fails with `CONNECT_TIMEOUT`, and HTTP on the existing development server port 3000 times out. No containers, volumes, or existing processes were reset or stopped. Restore Docker/database and restart the development server before resuming browser checks. Account implementation and remaining Quick Order WIP remain unstaged.

## Completed milestone: 2026-08-31

Docker recovered; the existing database was preserved. Feature commit `eee9a5c` was pushed after independent review, 84 unit/component tests, nine Quick Order browser tests, typecheck and production build passed. Full lint had zero errors and one existing Paystack warning. See `docs/TESTING.md` for exact commands and scope. The next implementation milestone is Supabase Auth, as defined in the parent customer-accounts design.
