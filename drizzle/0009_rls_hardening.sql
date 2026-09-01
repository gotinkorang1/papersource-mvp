-- Data API privilege and RLS baseline for PaperSource customer accounts.
-- Trusted Next.js server connections continue to use the database owner/service role.
begin;

create or replace function public.current_profile_id()
returns uuid
language sql
stable
set search_path = ''
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;

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
alter table profiles enable row level security;
alter table admin_roles enable row level security;
alter table organizations enable row level security;
alter table organization_members enable row level security;
alter table addresses enable row level security;
alter table document_counters enable row level security;
alter table carts enable row level security;
alter table cart_items enable row level security;
alter table quotes enable row level security;
alter table quote_items enable row level security;
alter table quote_events enable row level security;
alter table quote_access_tokens enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table payments enable row level security;
alter table payment_events enable row level security;
alter table uploaded_documents enable row level security;

-- Catalogue children are public only when their owning product is live.
drop policy if exists categories_public_read on categories;
create policy categories_public_read on categories for select
  using (active and deleted_at is null);

drop policy if exists brands_public_read on brands;
create policy brands_public_read on brands for select
  using (active and deleted_at is null);

drop policy if exists products_public_read on products;
create policy products_public_read on products for select
  using (status = 'active' and deleted_at is null);

drop policy if exists product_variants_public_read on product_variants;
create policy product_variants_public_read on product_variants for select
  using (
    active and exists (
      select 1 from products
      where products.id = product_variants.product_id
        and products.status = 'active'
        and products.deleted_at is null
    )
  );

drop policy if exists product_images_public_read on product_images;
create policy product_images_public_read on product_images for select
  using (exists (
    select 1 from products
    where products.id = product_images.product_id
      and products.status = 'active'
      and products.deleted_at is null
  ));

drop policy if exists product_attributes_public_read on product_attributes;
create policy product_attributes_public_read on product_attributes for select
  using (exists (
    select 1 from products
    where products.id = product_attributes.product_id
      and products.status = 'active'
      and products.deleted_at is null
  ));

drop policy if exists product_aliases_public_read on product_aliases;
create policy product_aliases_public_read on product_aliases for select
  using (exists (
    select 1 from products
    where products.id = product_aliases.product_id
      and products.status = 'active'
      and products.deleted_at is null
  ));

drop policy if exists price_tiers_public_read on price_tiers;
create policy price_tiers_public_read on price_tiers for select
  using (
    active and exists (
      select 1
      from product_variants
      join products on products.id = product_variants.product_id
      where product_variants.id = price_tiers.variant_id
        and product_variants.active
        and products.status = 'active'
        and products.deleted_at is null
    )
  );

drop policy if exists product_bundle_items_public_read on product_bundle_items;
create policy product_bundle_items_public_read on product_bundle_items for select
  using (
    exists (
      select 1 from products
      where products.id = product_bundle_items.bundle_product_id
        and products.status = 'active'
        and products.deleted_at is null
    )
    and exists (
      select 1
      from product_variants
      join products on products.id = product_variants.product_id
      where product_variants.id = product_bundle_items.variant_id
        and product_variants.active
        and products.status = 'active'
        and products.deleted_at is null
    )
  );

drop policy if exists inventory_public_read on inventory;

drop policy if exists delivery_zones_public_read on delivery_zones;
create policy delivery_zones_public_read on delivery_zones for select using (active);

-- Customer identity. Role/admin tables remain server-only.
drop policy if exists profiles_own_read on profiles;
create policy profiles_own_read on profiles for select
  using (id = public.current_profile_id());
drop policy if exists profiles_own_update on profiles;
create policy profiles_own_update on profiles for update
  using (id = public.current_profile_id())
  with check (id = public.current_profile_id());

drop policy if exists organization_members_own_read on organization_members;
create policy organization_members_own_read on organization_members for select
  using (profile_id = public.current_profile_id());

drop policy if exists organizations_member_read on organizations;
create policy organizations_member_read on organizations for select
  using (exists (
    select 1 from organization_members
    where organization_members.organization_id = organizations.id
      and organization_members.profile_id = public.current_profile_id()
  ));

drop policy if exists addresses_owner_or_member_read on addresses;
create policy addresses_owner_or_member_read on addresses for select
  using (
    owner_profile_id = public.current_profile_id()
    or exists (
      select 1 from organization_members
      where organization_members.organization_id = addresses.organization_id
        and organization_members.profile_id = public.current_profile_id()
    )
  );
drop policy if exists addresses_personal_insert on addresses;
create policy addresses_personal_insert on addresses for insert
  with check (owner_profile_id = public.current_profile_id() and organization_id is null);
drop policy if exists addresses_personal_update on addresses;
create policy addresses_personal_update on addresses for update
  using (owner_profile_id = public.current_profile_id() and organization_id is null)
  with check (owner_profile_id = public.current_profile_id() and organization_id is null);
drop policy if exists addresses_personal_delete on addresses;
create policy addresses_personal_delete on addresses for delete
  using (owner_profile_id = public.current_profile_id() and organization_id is null);

-- Authenticated carts may be manipulated only for the JWT-bound profile.
drop policy if exists carts_own_all on carts;
create policy carts_own_all on carts for all
  using (profile_id = public.current_profile_id())
  with check (profile_id = public.current_profile_id() and session_id is null);

drop policy if exists cart_items_own_all on cart_items;
create policy cart_items_own_all on cart_items for all
  using (exists (
    select 1 from carts
    where carts.id = cart_items.cart_id
      and carts.profile_id = public.current_profile_id()
  ))
  with check (exists (
    select 1 from carts
    where carts.id = cart_items.cart_id
      and carts.profile_id = public.current_profile_id()
  ));

-- Submitted commerce is readable by its owner or a current organisation member.
drop policy if exists quotes_owner_or_member_read on quotes;
create policy quotes_owner_or_member_read on quotes for select
  using (
    profile_id = public.current_profile_id()
    or exists (
      select 1 from organization_members
      where organization_members.organization_id = quotes.organization_id
        and organization_members.profile_id = public.current_profile_id()
    )
  );

drop policy if exists quote_items_owner_or_member_read on quote_items;
create policy quote_items_owner_or_member_read on quote_items for select
  using (exists (select 1 from quotes where quotes.id = quote_items.quote_id));

drop policy if exists quote_events_owner_or_member_read on quote_events;
create policy quote_events_owner_or_member_read on quote_events for select
  using (exists (select 1 from quotes where quotes.id = quote_events.quote_id));

drop policy if exists orders_owner_or_member_read on orders;
create policy orders_owner_or_member_read on orders for select
  using (
    profile_id = public.current_profile_id()
    or exists (
      select 1 from organization_members
      where organization_members.organization_id = orders.organization_id
        and organization_members.profile_id = public.current_profile_id()
    )
  );

drop policy if exists order_items_owner_or_member_read on order_items;
create policy order_items_owner_or_member_read on order_items for select
  using (exists (select 1 from orders where orders.id = order_items.order_id));

-- Supabase API roles are optional in the standalone local database. When present,
-- revoke ambient defaults and grant only the operations backed by policies above.
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon')
     and exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all privileges on all tables in schema public from anon, authenticated';
    execute 'revoke all privileges on all sequences in schema public from anon, authenticated';
    execute 'grant usage on schema public to anon, authenticated';
    execute 'grant execute on function public.current_profile_id() to anon, authenticated';
    execute 'grant select on categories, brands, products, product_variants, product_images, product_attributes, product_aliases, price_tiers, product_bundle_items, delivery_zones to anon, authenticated';
    execute 'grant select on profiles, organizations, organization_members, addresses, carts, cart_items, quotes, quote_items, quote_events, orders, order_items to authenticated';
    execute 'grant update (full_name, phone, updated_at) on profiles to authenticated';
    execute 'grant insert, update, delete on addresses, carts, cart_items to authenticated';
    execute 'alter default privileges in schema public revoke all privileges on tables from anon, authenticated';
    execute 'alter default privileges in schema public revoke all privileges on sequences from anon, authenticated';
  end if;
end $$;

commit;
