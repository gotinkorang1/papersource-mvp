-- Extra local staff so catalogue desks can be operated without SQL.
-- Apply only to the dedicated PaperSource database.

insert into profiles (id, email, full_name)
values
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'admin@papersource.test', 'PaperSource Admin'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'warehouse@papersource.test', 'PaperSource Warehouse'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'content@papersource.test', 'PaperSource Content')
on conflict (email) do nothing;

insert into admin_roles (profile_id, role)
values
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'admin'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'warehouse'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'content_manager')
on conflict (profile_id) do nothing;
