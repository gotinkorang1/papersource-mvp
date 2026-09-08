begin;

do $$ begin
  create type payment_mode as enum ('test', 'live');
exception when duplicate_object then null;
end $$;

alter table store_settings
  add column if not exists payments_enabled boolean not null default true,
  add column if not exists payment_mode payment_mode not null default 'test';

commit;
