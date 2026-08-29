# PaperSource — RFQ and Quotations

**Status:** Phase 0. Must not contradict [PRODUCT.md](PRODUCT.md).  
**Purpose:** Quote basket, guest RFQ, document upload, status machine, revisions, accept → order.  
Retail cart: [ECOMMERCE.md](ECOMMERCE.md). Schema: [DATABASE.md](DATABASE.md).

Quotes are **business objects**, not contact-form enquiries.

---

## 1. Quote basket ≠ cart

```text
Cart          3      →  /cart  →  /checkout
Quote List    8      →  /quote →  /request-quote
```

- Separate tables, separate drawers, separate counts.
- Adding to quote never mutates the cart.
- Corporate buyers can build a twenty-line RFQ while keeping a personal retail cart.

Draft quotes (`status = draft`) **are** the quote basket.

---

## 2. Who can submit

**Guests can submit RFQs.** An account is optional.

At submit, collect organisation + contact. The server may:

1. Create a lightweight `organizations` row (type from the form).
2. Store `guest_email`, `guest_phone`, `contact_name` on the quote.
3. If the guest later registers with the same email, staff or a claimed-email flow can attach `profile_id`.

Do not require organisation verification before the first RFQ.

---

## 3. Customer flow

### Step 1 — Add to Quote

Every product card and product page. Quantity uses the same selector as cart. Lines go to the draft quote.

Quick Order (`SKU + quantity` grid) → **Add all to Quote**.

### Step 2 — Quote basket (`/quote`)

Document-like list:

```text
Double A Paper       × 50
Bic Blue Pens        × 100
A4 Envelopes         × 200
HP 305 Ink           × 5
```

Edit qty, remove lines, see spec snapshots. Show live tier **preview** (may still say Request quote). Final prices are set by PaperSource unless a published tier already applies and sales accepts it.

### Step 3 — Customer information (`/request-quote`)

```text
Organisation name
Organisation type     Business / School / Government / NGO / Hospital / Church / University / Retailer / Other
Contact person
Phone                 required
Email                 required
Delivery location     Ghana address fields
Requested delivery date
Notes
```

### Step 4 — Optional uploads

Private Supabase Storage. MIME: PDF, Excel, Word, image.

Purposes:

```text
Purchase order
Procurement list
RFQ document
Other supporting file
```

Extremely important for schools and corporate clients.

### Step 5 — Submit RFQ

- Snapshot each line: name, SKU, spec, qty.
- Assign a public number (e.g. `PSQ-2026-000238`). Display as `RFQ-2026-000238` in customer copy if that reads clearer — **one canonical `quotes.number` in the DB**.
- Status → `submitted`.
- Email: Quote Received (customer) + Admin New RFQ (sales).
- Guest access: email link with secret token.

---

## 4. Status machine

Happy path:

```text
DRAFT
  → SUBMITTED
  → UNDER_REVIEW
  → PRICED
  → SENT
  → ACCEPTED
  → PAYMENT_PENDING
  → PAID
  → ORDER_CREATED
```

Other paths (first-class statuses):

```text
DECLINED
EXPIRED
CANCELLED
REVISED
```

Store as lowercase enums in the database (`draft`, `submitted`, …) matching [DATABASE.md](DATABASE.md).

### Allowed transitions

| From | To | Actor |
| --- | --- | --- |
| draft | submitted | customer / guest |
| draft | cancelled | customer / guest |
| submitted | under_review | sales / admin |
| submitted | declined | sales / admin |
| submitted | cancelled | customer (until review) or sales |
| under_review | priced | sales |
| under_review | declined | sales |
| priced | sent | sales (email Quote Ready) |
| priced | under_review | sales (rework before send) |
| sent | accepted | customer / guest (valid token) |
| sent | declined | customer |
| sent | expired | system (`expires_at`) |
| sent | revised | sales (clone; old → `revised`) |
| accepted | payment_pending | system (if Pay Now) |
| accepted | paid | system (webhook) **or** skip to terms path |
| accepted | order_created | system after terms confirmed without online pay |
| payment_pending | paid | Paystack verify |
| payment_pending | cancelled | sales / system (timeout) |
| paid | order_created | system |
| * (pre-accept) | cancelled | sales or customer per policy |
| * | declined | sales or customer when allowed |

Do not jump `submitted` → `order_created`.  
Do not let the client PATCH status to `paid`.

Every transition writes `quote_events`.

---

## 5. Sales workspace

`/admin/quotes` is the operating tool. Not Supabase table editor.

Sales can:

- Open RFQ, read notes and attachments (signed URLs)
- Set `under_review`
- Price each line (`unit_price` pesewas, VAT-inclusive) and optional delivery fee
- Use published tiers as a starting point; they may override
- Set expiry
- Send (status `sent`) → customer email Quote Ready
- Decline with a reason
- Revise: clone to a new quote (`parent_quote_id`), mark old `revised`, retain history
- After accept: take Pay Now **or** mark Bank Transfer / Purchase Order / Invoice Terms

Sales must not need SUPER_ADMIN. Sales must not edit `delivery_zones` config or Auth roles.

Warehouse does not price quotes.

---

## 6. Pricing a quote

1. Lines start with snapshots; `unit_price` may be null.
2. Sales enters unit prices (pesewas). Server computes `line_total`, `goods_total`, inclusive tax split (`tax_json`), delivery.
3. Nationwide / `on_request` zones: delivery may stay `pending_nationwide` until sales enters a fee.
4. `grand_total` is what Accept / Pay Now uses.
5. Status `priced` then `sent`. Customer cannot change unit prices. They may reject or request revision (enquiry or WhatsApp — support, not a second shadow price on the client).

Quote pricing is **server controlled**. The customer-facing Accept page displays server totals only.

---

## 7. Accept → pay or terms → order

Customer on `/quote/[id]`:

```text
Quote PSQ-00219
GHS 12,450
[ Accept Quote ]
```

After accept:

```text
[ Pay Now ]     → Paystack, same rules as retail
```

or admin has already indicated / later marks:

```text
Bank Transfer
Purchase Order
Invoice Terms
```

### Quote → Order

```text
Quote  →  Order  →  Invoice record  →  Delivery
```

When creating the order:

- `orders.source = quote`
- `orders.quote_id` set
- Copy line snapshots and totals from the **accepted** quote — do not re-run live catalogue tiers (the deal is the quote)
- Address and zone from the quote
- Then payment (Paystack or terms)
- `quote.status = paid` when payment success; then `order_created`
- Terms path: admin confirm → `order_created` without Paystack success; `payments.provider` = `bank_transfer` | `purchase_order` | `invoice_terms`

Inventory: decrement/reserve when paid **or** when terms are confirmed — same as [ECOMMERCE.md](ECOMMERCE.md).

Emails: Quote Accepted, Payment Confirmation, Admin notifications.

---

## 8. Revisions

- Never silently overwrite a `sent` quote the customer may have printed.
- Clone items, documents references as needed, `parent_quote_id` on the new row.
- Old quote → `revised` (terminal for that version).
- Customer email: Quote Revised, link to the new number.
- Timeline shows the chain.

---

## 9. Expiry and cancel

- `expires_at` set when sent (default e.g. 14 days — admin setting).
- Cron or on-read job: `sent` + past expiry → `expired`. Email Quote Expiring (before) if implemented in MVP (template listed — send at T-48h if cheap).
- Customer can cancel a `draft` or `submitted` (not yet under_review) quote.
- Sales can cancel with reason; audit log.

---

## 10. Documents

| Rule | Detail |
| --- | --- |
| Bucket | Private Supabase Storage |
| Attach | To `quote_id` via `uploaded_documents` |
| Authz | Guest token, owning profile, org member, or staff |
| Download | Signed URL after check |
| Admin | Preview list on the quote |

Do not put RFQ PDFs on Cloudinary public.

---

## 11. WhatsApp

Allowed: discuss a submitted quote, delivery questions, sales support.  
Link may include quote number.

Forbidden: replacing Submit RFQ or Accept Quote with “just WhatsApp us” as the only path.

---

## 12. Analytics

Emit:

```text
add_to_quote
quote_started
quote_submitted
```

And later in the funnel: accept, pay, order created.

Product → Quote and Quote → Accepted are core PaperSource metrics.

---

## 13. Cursor must / must not

**Must**

- Keep the quote basket separate from the retail cart.
- Allow guest RFQ with organisation + phone + email.
- Implement the full status machine and `quote_events`.
- Snapshot line items; retain revisions.
- Let accepted quotes generate orders at quoted prices.
- Price on the server; accept/pay using stored `grand_total`.

**Must not**

- Treat quotes as a contact form.
- Mix quote items into `cart_items`.
- Let the client set status to `paid`.
- Drop history when revising.
- Require a verified organisation before the first RFQ.
- Skip document upload in MVP.
