begin;

insert into delivery_zones (
  name, region, code, base_price, fee_mode, free_shipping_threshold,
  estimated_min_days, estimated_max_days, active, sort_order
)
values (
  'Shop pickup', 'Greater Accra', 'shop_pickup', 0, 'calculated', null,
  0, 0, true, 0
)
on conflict (code) do update set
  name = excluded.name,
  base_price = excluded.base_price,
  fee_mode = excluded.fee_mode,
  estimated_min_days = excluded.estimated_min_days,
  estimated_max_days = excluded.estimated_max_days,
  active = true,
  sort_order = excluded.sort_order;

commit;
