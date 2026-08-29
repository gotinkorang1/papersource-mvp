-- PaperSource catalogue (Phase 3). Apply only to a PaperSource database.
-- Do not run against unrelated Supabase projects.
-- Money columns are integer pesewas.

create extension if not exists pg_trgm;

do $$ begin
  create type product_type as enum ('standard', 'bundle');
exception when duplicate_object then null; end $$;

do $$ begin
  create type product_status as enum ('draft', 'active', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type delivery_fee_mode as enum ('calculated', 'on_request');
exception when duplicate_object then null; end $$;

do $$ begin
  create type inventory_movement_reason as enum (
    'receive', 'adjust', 'reserve', 'release', 'fulfil', 'return'
  );
exception when duplicate_object then null; end $$;

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references categories (id),
  name text not null,
  slug text not null unique,
  description text,
  position integer not null default 0,
  image_public_id text,
  active boolean not null default true,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_public_id text,
  active boolean not null default true,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  brand_id uuid not null references brands (id),
  category_id uuid not null references categories (id),
  product_type product_type not null default 'standard',
  description text,
  status product_status not null default 'draft',
  search_document tsvector,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id),
  sku text not null unique,
  barcode text,
  name text,
  unit_label text not null,
  base_unit_price integer not null,
  currency char(3) not null default 'GHS',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id),
  variant_id uuid references product_variants (id),
  cloudinary_public_id text not null,
  alt text not null,
  position integer not null default 0
);

create table if not exists product_attributes (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id),
  variant_id uuid references product_variants (id),
  namespace text not null,
  key text not null,
  value_text text not null,
  value_num integer,
  position integer not null default 0
);

create table if not exists product_aliases (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id),
  variant_id uuid references product_variants (id),
  alias text not null
);

create table if not exists price_tiers (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references product_variants (id),
  minimum_quantity integer not null,
  maximum_quantity integer,
  unit_price integer,
  request_quote boolean not null default false,
  currency char(3) not null default 'GHS',
  active boolean not null default true
);

create table if not exists product_bundle_items (
  id uuid primary key default gen_random_uuid(),
  bundle_product_id uuid not null references products (id),
  variant_id uuid not null references product_variants (id),
  quantity integer not null
);

create table if not exists inventory (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null unique references product_variants (id),
  on_hand integer not null default 0,
  reserved integer not null default 0,
  low_stock_threshold integer not null default 5
);

create table if not exists inventory_movements (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references product_variants (id),
  delta integer not null,
  reason inventory_movement_reason not null,
  reference_type text,
  reference_id uuid,
  created_by uuid,
  created_at timestamptz not null default now()
);

create table if not exists delivery_zones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  region text not null,
  code text not null unique,
  base_price integer not null,
  fee_mode delivery_fee_mode not null,
  free_shipping_threshold integer,
  estimated_min_days integer not null,
  estimated_max_days integer not null,
  active boolean not null default true,
  sort_order integer not null default 0
);

create index if not exists products_search_gin on products using gin (search_document);
create index if not exists product_variants_sku_trgm on product_variants using gin (sku gin_trgm_ops);
create index if not exists product_aliases_trgm on product_aliases using gin (alias gin_trgm_ops);
create index if not exists products_name_trgm on products using gin (name gin_trgm_ops);

alter table categories enable row level security;
alter table brands enable row level security;
alter table products enable row level security;
alter table product_variants enable row level security;
alter table product_images enable row level security;
alter table product_attributes enable row level security;
alter table product_aliases enable row level security;
alter table price_tiers enable row level security;
alter table product_bundle_items enable row level security;
alter table inventory enable row level security;
alter table inventory_movements enable row level security;
alter table delivery_zones enable row level security;

drop policy if exists categories_public_read on categories;
create policy categories_public_read on categories
  for select using (active = true and deleted_at is null);

drop policy if exists brands_public_read on brands;
create policy brands_public_read on brands
  for select using (active = true and deleted_at is null);

drop policy if exists products_public_read on products;
create policy products_public_read on products
  for select using (status = 'active' and deleted_at is null);

drop policy if exists product_variants_public_read on product_variants;
create policy product_variants_public_read on product_variants
  for select using (active = true);

drop policy if exists product_images_public_read on product_images;
create policy product_images_public_read on product_images for select using (true);

drop policy if exists product_attributes_public_read on product_attributes;
create policy product_attributes_public_read on product_attributes for select using (true);

drop policy if exists product_aliases_public_read on product_aliases;
create policy product_aliases_public_read on product_aliases for select using (true);

drop policy if exists price_tiers_public_read on price_tiers;
create policy price_tiers_public_read on price_tiers
  for select using (active = true);

drop policy if exists product_bundle_items_public_read on product_bundle_items;
create policy product_bundle_items_public_read on product_bundle_items for select using (true);

drop policy if exists inventory_public_read on inventory;
create policy inventory_public_read on inventory for select using (true);

drop policy if exists delivery_zones_public_read on delivery_zones;
create policy delivery_zones_public_read on delivery_zones
  for select using (active = true);

-- No public writes. Staff mutations go through the Next.js server (service role).
