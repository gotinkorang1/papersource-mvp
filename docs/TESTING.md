# PaperSource — Testing

**Status:** Phase 0. Must not contradict [PRODUCT.md](PRODUCT.md).  
**Purpose:** Three-layer testing plus browser verification. A feature is not done when the code “looks fine.”

---

## 1. Layers

| Layer | Tool | Owns |
| --- | --- | --- |
| Unit | **Vitest** | Pricing resolver, VAT inclusive split, zone fee, quote transitions, pesewa format, Paystack amount conversion |
| Component | **React Testing Library** | ProductCard dual CTAs, quantity + tier preview, Ghana address fields, quote vs cart counts |
| E2E | **Playwright** | Critical journeys below |

Do not add a fourth framework without a written reason.

---

## 2. What “done” means for UI work

Every major feature must:

```text
implement
  → test
  → open in a browser
  → verify mobile
  → verify desktop
  → check console
```

Not:

```text
implement
  → looks good in code
  → DONE
```

If browser tools are available, exercise the flow as a user (click, type, submit). A single screenshot is not verification. If they are not available, use Playwright/dev server and say what could not be clicked.

Check:

- Pages that share cart, quote, or auth state
- Empty, error, and nationwide-request states
- Desktop and mobile when layout/nav changed
- No stray console errors on the happy path

---

## 3. Unit tests (must exist)

| Module | Cases |
| --- | --- |
| Price tiers | Qty hits each band; open-ended `request_quote`; no overlap surprises; fallback `base_unit_price` |
| Money | Pesewas ↔ `GHS 78.99`; no float residual |
| VAT split | Inclusive → `tax_total` + `tax_json`; one rounding function |
| Delivery | Calculated fee; free-shipping threshold; `on_request` does not invent a fee |
| Quote state machine | Allow-list transitions; reject `submitted` → `paid` |
| Paystack adapter | Amount mapping; reject mismatched verify |
| Webhook | Duplicate `provider_event_id` is no-op |

Pricing tests must not import React.

---

## 4. Component tests

- `ProductCard` shows spec line, unit price, tier hint, stock, **Add to Cart** and **Add to Quote**.
- Adding to quote does not fire cart increment (mock handlers).
- Address form: phone required; no required ZIP; GhanaPost GPS optional.
- Header: independent cart and quote counts.

---

## 5. Critical E2E flows

These must have Playwright coverage before MVP launch. Use test data / Paystack test mode. **Do not** put live secrets in the repo.

| Flow | Assert |
| --- | --- |
| Search → Product → Cart | Search `A4 80gsm` or SKU; open PDP; add to cart; cart count +1; quote count unchanged |
| Product → Quote basket → RFQ | Add 10 units to quote; submit guest RFQ with org + phone + email; status submitted; number visible |
| Guest checkout | Ghana address; Accra or Tema zone; order created; Paystack init URL or test stub |
| User checkout | Logged-in address book; same as guest for payment init |
| Paystack initialization | Server creates payment row + reference; amount = order grand_total |
| Webhook processing | Signed test payload (or fixture) marks paid once; replay does not double-fulfil |
| Admin creates product | Staff session; product + variant + tier; appears on `/shop` |
| Admin responds to quote | submitted → under_review → priced → sent |
| Quote acceptance | Customer/guest token; Accept; status accepted |
| Quote → order conversion | After pay or terms; order snapshots quote prices; `source = quote` |
| Delivery calculation | Accra/Tema fee from DB; Other Region / nationwide does not set a fake fee |

Additional recommended:

- Quick Order: two SKUs → quote basket
- Dual path: add to cart and quote in one session; both counts correct
- Mobile bottom nav: Quote and Cart both reachable
- `noindex` not required in E2E; metadata unit/component optional

---

## 6. Paystack in tests

- Unit/E2E against **mocks** or Paystack test keys in CI secrets.
- Webhook tests use a fixture body + valid test signature algorithm, or inject a verified adapter.
- Never assert payment success from a redirect URL alone.
- Idempotency test is mandatory.

---

## 7. Accessibility and quality gates

- axe on home, shop, PDP, checkout, quote submit (Playwright or RTL).
- Keyboard: mega menu, drawers, dual CTAs.
- Lighthouse as a periodic check, not a vanity merge blocker in early phases — fix serious a11y/SEO issues on templates.

Honour `prefers-reduced-motion` in visual tests if animations are asserted.

---

## 8. CI

On GitHub: lint, `tsc --noEmit`, Vitest, Playwright (critical project). Vercel preview for human QA.

Do not skip hooks to land broken pricing or webhook code.

---

## 9. Cursor must / must not

**Must**

- Add Vitest coverage when changing pricing, VAT, zones, or quote transitions.
- Add or update Playwright for the critical flows when those features land.
- Verify UI in a browser (or Playwright) on desktop and mobile.
- Test webhook idempotency.

**Must not**

- Declare a storefront feature done from code review alone.
- Use production Paystack keys in CI.
- Skip dual-path assertions (cart vs quote).
- Test only the desktop header and ignore mobile Quote/Cart nav.
