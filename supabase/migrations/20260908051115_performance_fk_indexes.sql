-- Cover foreign-key columns used by joins, ownership reads and cascades.
-- These indexes are additive and safe to apply repeatedly.
create index if not exists addresses_organization_idx on public.addresses (organization_id);
create index if not exists cart_items_variant_idx on public.cart_items (variant_id);
create index if not exists inventory_movements_variant_idx on public.inventory_movements (variant_id);
create index if not exists orders_quote_idx on public.orders (quote_id);
create index if not exists orders_delivery_zone_idx on public.orders (delivery_zone_id);
create index if not exists quotes_delivery_zone_idx on public.quotes (delivery_zone_id);
create index if not exists quotes_parent_idx on public.quotes (parent_quote_id);
create index if not exists quote_access_tokens_quote_idx on public.quote_access_tokens (quote_id);
create index if not exists uploaded_documents_order_idx on public.uploaded_documents (order_id);
create index if not exists product_images_variant_idx on public.product_images (variant_id);
create index if not exists product_attributes_variant_idx on public.product_attributes (variant_id);
create index if not exists product_aliases_variant_idx on public.product_aliases (variant_id);
create index if not exists product_bundle_items_variant_idx on public.product_bundle_items (variant_id);
create index if not exists order_items_variant_idx on public.order_items (variant_id);
