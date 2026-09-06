create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  title text,
  body text not null check (char_length(body) between 10 and 2000),
  display_name text not null check (char_length(display_name) between 1 and 80),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_reviews_profile_product_unique unique (product_id, profile_id)
);
create index if not exists product_reviews_product_status_idx on public.product_reviews(product_id, status);
alter table public.product_reviews enable row level security;
drop policy if exists "approved reviews are publicly readable" on public.product_reviews;
create policy "approved reviews are publicly readable" on public.product_reviews for select to anon, authenticated using (status = 'approved');
drop policy if exists "customers can submit their own reviews" on public.product_reviews;
create policy "customers can submit their own reviews" on public.product_reviews for insert to authenticated with check ((select auth.uid()) = profile_id and status = 'pending');
drop policy if exists "customers can update their pending reviews" on public.product_reviews;
create policy "customers can update their pending reviews" on public.product_reviews for update to authenticated using ((select auth.uid()) = profile_id and status = 'pending') with check ((select auth.uid()) = profile_id and status = 'pending');
