-- Singleton operational settings. Read and writes are server-only behind staff RBAC.
begin;

create table if not exists store_settings (
  id text primary key default 'store' check (id = 'store'),
  vat_rate_bps integer not null default 1500 check (vat_rate_bps between 0 and 10000),
  quote_expiry_days integer not null default 14 check (quote_expiry_days between 1 and 90),
  whatsapp_business_number text,
  site_url text not null default 'http://localhost:3000',
  updated_by uuid references profiles (id) on delete set null,
  updated_at timestamptz not null default now()
);

insert into store_settings (id) values ('store') on conflict (id) do nothing;
alter table store_settings enable row level security;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all privileges on store_settings from anon';
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all privileges on store_settings from authenticated';
  end if;
end $$;

commit;
