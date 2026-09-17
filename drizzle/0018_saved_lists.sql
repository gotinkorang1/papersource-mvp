begin;

create table if not exists saved_lists (
  id uuid primary key default gen_random_uuid(),
  owner_profile_id uuid references profiles (id) on delete cascade,
  organization_id uuid references organizations (id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint saved_lists_one_owner_check check (num_nonnulls(owner_profile_id, organization_id) = 1)
);

create index if not exists saved_lists_profile_idx on saved_lists (owner_profile_id);
create index if not exists saved_lists_organization_idx on saved_lists (organization_id);

create table if not exists saved_list_items (
  id uuid primary key default gen_random_uuid(),
  saved_list_id uuid not null references saved_lists (id) on delete cascade,
  variant_id uuid not null references product_variants (id),
  quantity integer not null default 1,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint saved_list_items_quantity_positive check (quantity > 0),
  constraint saved_list_items_list_variant_unique unique (saved_list_id, variant_id)
);

create index if not exists saved_list_items_list_idx on saved_list_items (saved_list_id);
create index if not exists saved_list_items_variant_idx on saved_list_items (variant_id);

alter table saved_lists enable row level security;
alter table saved_list_items enable row level security;

drop policy if exists saved_lists_owner_or_member_read on saved_lists;
create policy saved_lists_owner_or_member_read on saved_lists for select
  using (
    owner_profile_id = public.current_profile_id()
    or exists (
      select 1 from organization_members
      where organization_members.organization_id = saved_lists.organization_id
        and organization_members.profile_id = public.current_profile_id()
    )
  );

drop policy if exists saved_list_items_owner_or_member_read on saved_list_items;
create policy saved_list_items_owner_or_member_read on saved_list_items for select
  using (exists (select 1 from saved_lists where saved_lists.id = saved_list_items.saved_list_id));

commit;
