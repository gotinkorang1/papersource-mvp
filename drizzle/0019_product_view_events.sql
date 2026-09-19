begin;

create table if not exists product_view_events (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  fingerprint text not null,
  event_day date not null,
  occurred_at timestamptz not null default now(),
  constraint product_view_events_fingerprint_length check (char_length(fingerprint) between 8 and 128),
  constraint product_view_events_daily_unique unique (product_id, fingerprint, event_day)
);

create index if not exists product_view_events_product_time_idx on product_view_events (product_id, occurred_at);

alter table product_view_events enable row level security;

drop policy if exists product_view_events_no_public_read on product_view_events;
create policy product_view_events_no_public_read on product_view_events for select using (false);

drop policy if exists product_view_events_no_public_insert on product_view_events;
create policy product_view_events_no_public_insert on product_view_events for insert with check (false);

commit;
