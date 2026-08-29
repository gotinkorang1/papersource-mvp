-- Paystack payments. Apply only to the PaperSource database.

do $$ begin
  create type payment_provider as enum (
    'paystack',
    'bank_transfer',
    'purchase_order',
    'invoice_terms'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum (
    'initialized',
    'pending',
    'success',
    'failed',
    'abandoned'
  );
exception when duplicate_object then null; end $$;

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  provider payment_provider not null,
  status payment_status not null,
  amount integer not null,
  currency char(3) not null default 'GHS',
  paystack_reference text unique,
  authorization_url text,
  raw_init jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists payment_events (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references payments (id) on delete cascade,
  provider_event_id text not null unique,
  event_type text not null,
  payload jsonb,
  processed_at timestamptz not null default now()
);

create index if not exists payments_order_idx on payments (order_id);
create index if not exists payments_status_idx on payments (status);
create index if not exists payment_events_payment_idx on payment_events (payment_id);

alter table payments enable row level security;
alter table payment_events enable row level security;
