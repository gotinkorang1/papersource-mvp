# Saved Lists and Reorder Design

## Goal

Give retail customers, organisations, schools, and offices a durable way to save frequently purchased stationery and rebuild a previous order without changing the separate retail-cart and quote-basket purchase paths.

## Scope

### Included

- Authenticated personal saved lists.
- Organisation saved lists for members with the appropriate organisation role.
- Product-variant list items with quantity and optional note.
- Add current product or variant to a saved list.
- Add all valid list items to the retail cart or quote basket explicitly.
- Reorder from eligible historical order items.
- Clear handling for inactive, deleted, unavailable, or changed variants.
- Admin visibility into list usage only if existing operational reporting can support it without exposing customer data unnecessarily.

### Excluded from this slice

- Automatic recurring subscriptions.
- Automatic purchasing or payment.
- Organisation approval workflows.
- Customer-specific price books.
- Wishlist sharing with public links.
- Changing checkout, quote pricing, inventory reservation, or payment rules.

## Data model

Add saved-list entities using the existing Drizzle schema conventions:

- saved_lists: id, owner profile or organisation reference, name, description, timestamps.
- saved_list_items: id, saved list reference, variant reference, quantity, note, timestamps.
- Enforce exactly one owner scope per list and unique variant per list.
- Add indexes for owner scope and list items.
- Use foreign keys with cascade deletion for list ownership and list items.
- Keep the current product/variant as the source of truth when rebuilding a cart or quote. Never copy a stale price into a new purchase.
- Preserve an item’s last-known name/SKU only for a useful unavailable-item message, not for pricing or checkout.

## Authorization

- Personal lists are readable and writable only by the owning authenticated profile.
- Organisation lists are readable by organisation members and writable by members with an organisation purchasing role.
- Server-side authorization must run inside every read and mutation.
- Anonymous users may add to a temporary client-side list only if the existing client state layer supports it; anonymous persistence is not required for the first slice.
- Staff access is not automatically granted to customer lists.

## User experience

### Account

Add a Saved lists area to the account navigation. Show list name, owner scope, item count, updated date, and actions to open, rename, duplicate, or delete where authorized.

### Product surfaces

Add a compact “Save to list” action to product detail and product-card/quick-view contexts where an authenticated user can act. If unauthenticated, route to login while preserving the intended product.

### List detail

Show current availability, current price, stock state, and a warning for unavailable items. Provide separate actions:

- Add available items to Cart.
- Add available items to Quote.
- Remove unavailable items.
- Edit quantities.
- Add a product to the list.

These actions must never combine or silently switch the two purchase paths.

### Reorder

On an eligible order detail/account order page, show “Reorder available items.” Rebuild from current active variants and current server prices. Report unavailable or changed items before the user continues. The result goes to the retail cart only; quote reconstruction remains an explicit future workflow unless the user chooses “Save order items to list.”

## Server contracts

Create focused repository functions with explicit return types:

- listSavedLists(actor)
- getSavedList(actor, listId)
- createSavedList(actor, input)
- updateSavedList(actor, input)
- deleteSavedList(actor, listId)
- addSavedListItem(actor, input)
- removeSavedListItem(actor, input)
- addSavedListToCart(actor, listId)
- getReorderAvailability(actor, orderId)
- addReorderableItemsToCart(actor, orderId)

Mutation results must distinguish added items, unavailable items, authorization failures, and validation errors. Cart insertion must reuse the existing server-authoritative cart mutation path.

## Error and data rules

- Reject empty names, invalid quantities, unknown variants, and unauthorized scopes.
- Reject duplicate variants within a list or update the existing quantity deterministically.
- If a variant is inactive or its product is deleted, keep the saved item visible with an unavailable state instead of deleting it silently.
- If a previous order item has no current variant reference, show it as unavailable and preserve its snapshot for explanation only.
- Never trust client-provided price, product name, ownership, or organisation membership.
- Mutations should be idempotent where retry is possible.

## Verification

- Unit-test owner and organisation authorization decisions.
- Unit-test duplicate-item merging, quantity validation, and unavailable-item classification.
- Test server actions cannot add a stale price to a cart.
- Test retail-cart and quote-basket isolation.
- Test product/list/order UI states for empty, loading, error, unavailable, and success cases.
- Run migrations against a clean database and an existing database.
- Run lint, typecheck, unit tests, production build, and authenticated browser smoke checks for personal and organisation contexts.

## Delivery phases

1. Schema migration and repository authorization contracts.
2. Personal lists and account UI.
3. Product save actions and list detail actions.
4. Reorder availability and current-price cart reconstruction.
5. Organisation scope and role checks.
6. Responsive/accessibility hardening and production verification.

