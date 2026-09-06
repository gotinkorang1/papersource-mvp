create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_profile_id uuid references profiles(id) on delete set null,
  action text not null,
  resource_type text not null,
  resource_id text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_created_at_idx on audit_logs(created_at desc);
create index if not exists audit_logs_resource_idx on audit_logs(resource_type, resource_id);
create index if not exists audit_logs_actor_idx on audit_logs(actor_profile_id);

alter table audit_logs enable row level security;
revoke all on table audit_logs from anon, authenticated;
