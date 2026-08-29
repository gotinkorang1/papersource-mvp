-- Guest checkout orders and RFQ submit. Apply only to the PaperSource database.

do $$ begin
  create type organization_type as enum (
    'business',
    'school',
    'government',
    'ngo',
    'hospital',
    'church',
    'university',
    'retailer',
    'other'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_source as enum ('cart', 'quote');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status as enum (
    'pending_payment',
    'awaiting_terms',
    'paid',
    'processing',
    'out_for_delivery',
    'delivered',
    'cancelled'
  );
exception when duplicate_object then null; end $$;

create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  type organization_type not null default 'business',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists addresses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations (id),
  full_name text not null,
  phone text not null,
  region text not null,
  city_town text not null,
  area_suburb text,
  street_landmark text,
  ghanapost_gps text,
  delivery_instructions text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists document_counters (
  kind text not null,
  year integer not null,
  value integer not null,
  primary key (kind, year)
);

alter table quotes
  add column if not exists requested_delivery_date date;

create table if not exists quote_access_tokens (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references quotes (id) on delete cascade,
  token text not null unique,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  number text not null unique,
  source order_source not null,
  quote_id uuid,
  profile_id uuid,
  organization_id uuid references organizations (id),
  session_id text,
  status order_status not null,
  currency char(3) not null default 'GHS',
  goods_total integer not null,
  tax_total integer not null,
  tax_json jsonb,
  delivery_fee integer not null default 0,
  delivery_fee_status delivery_fee_status not null,
  discount_total integer not null default 0,
  grand_total integer not null,
  address_snapshot jsonb not null,
  delivery_zone_id uuid not null references delivery_zones (id),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  variant_id uuid references product_variants (id),
  name_snapshot text not null,
  sku_snapshot text not null,
  spec_snapshot text,
  quantity integer not null check (quantity > 0),
  unit_price integer not null,
  line_total integer not null,
  tax_total integer not null default 0
);

create index if not exists orders_session_idx on orders (session_id);
create index if not exists orders_status_idx on orders (status);
create index if not exists order_items_order_idx on order_items (order_id);

alter table organizations enable row level security;
alter table addresses enable row level security;
alter table document_counters enable row level security;
alter table quote_access_tokens enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
