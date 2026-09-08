-- Restore the FK indexes represented in the application schema but missing on
-- the hosted database. IF NOT EXISTS keeps this safe across environments.
create index if not exists categories_parent_idx on public.categories (parent_id);
create index if not exists price_tiers_variant_idx on public.price_tiers (variant_id);
create index if not exists product_aliases_product_idx on public.product_aliases (product_id);
create index if not exists product_attributes_product_idx on public.product_attributes (product_id);
create index if not exists product_bundle_items_bundle_idx on public.product_bundle_items (bundle_product_id);
create index if not exists product_images_product_idx on public.product_images (product_id);
create index if not exists product_reviews_profile_idx on public.product_reviews (profile_id);
create index if not exists product_variants_product_idx on public.product_variants (product_id);
create index if not exists products_brand_idx on public.products (brand_id);
create index if not exists products_category_idx on public.products (category_id);
create index if not exists quote_events_quote_idx on public.quote_events (quote_id);
create index if not exists store_settings_updated_by_idx on public.store_settings (updated_by);
