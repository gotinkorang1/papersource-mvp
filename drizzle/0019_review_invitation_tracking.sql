alter table public.orders
  add column if not exists review_invitation_sent_at timestamptz;

create index if not exists orders_review_invitation_idx
  on public.orders(status, review_invitation_sent_at, updated_at);
