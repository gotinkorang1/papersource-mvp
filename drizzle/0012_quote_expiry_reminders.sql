begin;
alter table quotes add column if not exists expiry_reminder_sent_at timestamptz;
create index if not exists quotes_expiry_reminder_idx on quotes (status, expires_at, expiry_reminder_sent_at);
commit;
