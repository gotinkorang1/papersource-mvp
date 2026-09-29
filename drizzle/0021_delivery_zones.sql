begin;

-- Keep the checkout and quote flows usable after a fresh or partially seeded
-- deployment.  These are the server-authoritative defaults from the product
-- specification; admins can adjust them later from Delivery zones.
insert into delivery_zones (
  name, region, code, base_price, fee_mode, free_shipping_threshold,
  estimated_min_days, estimated_max_days, active, sort_order
)
values
  ('Shop pickup', 'Greater Accra', 'shop_pickup', 0, 'calculated', null, 0, 0, true, 0),
  ('Accra Central', 'Greater Accra', 'accra_central', 2500, 'calculated', null, 1, 2, true, 1),
  ('Accra East', 'Greater Accra', 'accra_east', 2500, 'calculated', null, 1, 2, true, 2),
  ('Accra West', 'Greater Accra', 'accra_west', 2500, 'calculated', null, 1, 2, true, 3),
  ('Accra North', 'Greater Accra', 'accra_north', 2800, 'calculated', null, 1, 2, true, 4),
  ('Tema', 'Greater Accra', 'tema', 3000, 'calculated', null, 1, 2, true, 5),
  ('Tema Industrial Area', 'Greater Accra', 'tema_industrial', 3200, 'calculated', null, 1, 2, true, 6),
  ('Other Greater Accra', 'Greater Accra', 'other_greater_accra', 4000, 'calculated', null, 1, 3, true, 7),
  ('Nationwide Request', 'Nationwide', 'nationwide_request', 0, 'on_request', null, 3, 10, true, 8)
on conflict (code) do update set
  name = excluded.name,
  region = excluded.region,
  base_price = excluded.base_price,
  fee_mode = excluded.fee_mode,
  estimated_min_days = excluded.estimated_min_days,
  estimated_max_days = excluded.estimated_max_days,
  active = true,
  sort_order = excluded.sort_order;

commit;
