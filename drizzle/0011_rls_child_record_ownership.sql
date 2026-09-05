-- Close ownership gaps on commerce child records.
-- Child rows must never be readable merely because their parent exists.
begin;

drop policy if exists quote_items_owner_or_member_read on quote_items;
create policy quote_items_owner_or_member_read on quote_items for select
  using (exists (
    select 1 from quotes
    where quotes.id = quote_items.quote_id
      and (
        quotes.profile_id = public.current_profile_id()
        or exists (
          select 1 from organization_members
          where organization_members.organization_id = quotes.organization_id
            and organization_members.profile_id = public.current_profile_id()
        )
      )
  ));

drop policy if exists quote_events_owner_or_member_read on quote_events;
create policy quote_events_owner_or_member_read on quote_events for select
  using (exists (
    select 1 from quotes
    where quotes.id = quote_events.quote_id
      and (
        quotes.profile_id = public.current_profile_id()
        or exists (
          select 1 from organization_members
          where organization_members.organization_id = quotes.organization_id
            and organization_members.profile_id = public.current_profile_id()
        )
      )
  ));

drop policy if exists order_items_owner_or_member_read on order_items;
create policy order_items_owner_or_member_read on order_items for select
  using (exists (
    select 1 from orders
    where orders.id = order_items.order_id
      and (
        orders.profile_id = public.current_profile_id()
        or exists (
          select 1 from organization_members
          where organization_members.organization_id = orders.organization_id
            and organization_members.profile_id = public.current_profile_id()
        )
      )
  ));

commit;
