-- Guest cart and draft quote basket (Phase 4).
-- Apply only to the dedicated PaperSource database.
-- Money columns are integer pesewas. Number is null until an RFQ is submitted.

do $$ begin
  create type quote_status as enum (
    'draft',
    'submitted',
    'under_review',
    'priced',
    'sent',
    'accepted',
    'payment_pending',
    'paid',
    'order_created',
    'declined',
    'expired',
    'cancelled',
    'revised'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type delivery_fee_status as enum (
    'calculated',
    'pending_nationwide',
    'waived'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type quote_actor_type as enum (
    'customer',
    'guest',
    'admin',
    'system'
  );
exception when duplicate_object then null; end $$;

create table if not exists carts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid,
  session_id text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references carts (id) on delete cascade,
  variant_id uuid not null references product_variants (id),
  quantity integer not null check (quantity > 0),
  unique (cart_id, variant_id)
);

create table if not exists quotes (
  id uuid primary key default gen_random_uuid(),
  number text unique,
  status quote_status not null default 'draft',
  profile_id uuid,
  session_id text,
  guest_email text,
  guest_phone text,
  organization_id uuid,
  contact_name text,
  delivery_zone_id uuid references delivery_zones (id),
  notes text,
  currency char(3) not null default 'GHS',
  goods_total integer not null default 0,
  tax_total integer not null default 0,
  tax_json jsonb,
  delivery_fee integer not null default 0,
  delivery_fee_status delivery_fee_status not null default 'calculated',
  grand_total integer not null default 0,
  expires_at timestamptz,
  parent_quote_id uuid references quotes (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists quotes_session_draft_unique
  on quotes (session_id)
  where status = 'draft' and session_id is not null;

create table if not exists quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references quotes (id) on delete cascade,
  variant_id uuid references product_variants (id),
  name_snapshot text not null,
  sku_snapshot text not null,
  spec_snapshot text,
  quantity integer not null check (quantity > 0),
  unit_price integer,
  line_total integer,
  notes text
);

create unique index if not exists quote_items_quote_variant_unique
  on quote_items (quote_id, variant_id)
  where variant_id is not null;

create table if not exists quote_events (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references quotes (id) on delete cascade,
  from_status text,
  to_status text not null,
  actor_type quote_actor_type not null,
  actor_id uuid,
  payload jsonb,
  created_at timestamptz not null default now()
);

alter table carts enable row level security;
alter table cart_items enable row level security;
alter table quotes enable row level security;
alter table quote_items enable row level security;
alter table quote_events enable row level security;

-- No public policies. Guest cart/quote access is via the Next.js server only.
