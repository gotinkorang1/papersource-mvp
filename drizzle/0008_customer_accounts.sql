-- Customer accounts use Supabase Auth only. This migration is transactional and
-- refuses duplicate/orphaned legacy ownership; it never deletes user records.
begin;

do $$ begin
  create type organization_member_role as enum ('owner', 'member');
exception when duplicate_object then null; end $$;

create table if not exists organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations (id) on delete cascade,
  profile_id uuid not null references profiles (id) on delete cascade,
  role organization_member_role not null default 'member',
  created_at timestamptz not null default now(),
  unique (organization_id, profile_id)
);

alter table addresses
  add column if not exists owner_profile_id uuid references profiles (id) on delete cascade;

alter table addresses
  add column if not exists is_default boolean not null default false;

alter table addresses
  add column if not exists delivery_area text not null default 'accra';

create index if not exists addresses_owner_idx on addresses (owner_profile_id);
create index if not exists organization_members_profile_idx on organization_members (profile_id);

-- Index creation is the duplicate-data preflight: failure rolls everything back.
create unique index if not exists profiles_email_ci_unique on profiles (lower(email));
create unique index if not exists organization_members_one_per_profile on organization_members (profile_id);
create unique index if not exists addresses_one_personal_default on addresses (owner_profile_id)
  where is_default and owner_profile_id is not null and organization_id is null;

alter table carts alter column session_id drop not null;
drop index if exists carts_session_unique;
create unique index if not exists carts_profile_unique on carts (profile_id) where profile_id is not null;
create unique index if not exists carts_guest_session_unique on carts (session_id) where profile_id is null and session_id is not null;
create unique index if not exists quotes_profile_draft_unique on quotes (profile_id) where profile_id is not null and status = 'draft';
create unique index if not exists quotes_guest_draft_unique on quotes (session_id) where profile_id is null and session_id is not null and status = 'draft';
create index if not exists quotes_profile_idx on quotes (profile_id);
create index if not exists quotes_organization_idx on quotes (organization_id);
create index if not exists orders_profile_idx on orders (profile_id);
create index if not exists orders_organization_idx on orders (organization_id);

-- Validated foreign keys also preflight legacy orphan references atomically.
do $$
declare item record;
begin
  for item in select * from (values
    ('carts', 'profile_id', 'profiles', 'carts_profile_fk'),
    ('quotes', 'profile_id', 'profiles', 'quotes_profile_fk'),
    ('quotes', 'organization_id', 'organizations', 'quotes_organization_fk'),
    ('quotes', 'parent_quote_id', 'quotes', 'quotes_parent_fk'),
    ('orders', 'profile_id', 'profiles', 'orders_profile_fk'),
    ('orders', 'quote_id', 'quotes', 'orders_quote_fk')
  ) as definitions(table_name, column_name, target_name, constraint_name)
  loop
    if not exists (select 1 from pg_constraint where conname = item.constraint_name and conrelid = ('public.' || item.table_name)::regclass) then
      execute format('alter table public.%I add constraint %I foreign key (%I) references public.%I(id)', item.table_name, item.constraint_name, item.column_name, item.target_name);
    end if;
  end loop;
end $$;

alter table organization_members enable row level security;
alter table addresses enable row level security;
commit;
