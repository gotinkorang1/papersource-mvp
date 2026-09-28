alter table public.product_reviews
  add column if not exists order_id uuid references public.orders(id) on delete set null;

alter table public.product_reviews
  add column if not exists verified_purchase boolean not null default false;

create index if not exists product_reviews_order_idx on public.product_reviews(order_id);
create index if not exists product_reviews_verified_idx on public.product_reviews(product_id, status, verified_purchase);

drop policy if exists "approved reviews are publicly readable" on public.product_reviews;
create policy "approved verified reviews are publicly readable" on public.product_reviews
  for select to anon, authenticated
  using (status = 'approved' and verified_purchase = true);
