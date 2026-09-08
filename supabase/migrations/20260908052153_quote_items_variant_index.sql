-- Cover the quote item -> product variant foreign key for joins and deletes.
create index if not exists quote_items_variant_idx
  on public.quote_items (variant_id);
