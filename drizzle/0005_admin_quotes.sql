-- Staff RBAC and quote address snapshots for accept → order.
-- Apply only to the dedicated PaperSource database.

do $$ begin
  create type staff_role as enum (
    'super_admin',
    'admin',
    'sales',
    'warehouse',
    'content_manager'
  );
exception when duplicate_object then null; end $$;

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  full_name text not null,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists admin_roles (
  profile_id uuid primary key references profiles (id) on delete cascade,
  role staff_role not null,
  created_at timestamptz not null default now()
);

alter table quotes
  add column if not exists address_snapshot jsonb;

alter table profiles enable row level security;
alter table admin_roles enable row level security;

insert into profiles (id, email, full_name)
values (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'sales@papersource.test',
  'PaperSource Sales'
)
on conflict (email) do nothing;

insert into admin_roles (profile_id, role)
values (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'sales'
)
on conflict (profile_id) do nothing;
