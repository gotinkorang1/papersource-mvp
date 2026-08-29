-- Private RFQ / PO documents. Apply only to the PaperSource database.

do $$ begin
  create type document_purpose as enum (
    'rfq',
    'purchase_order',
    'procurement_list',
    'invoice',
    'internal'
  );
exception when duplicate_object then null; end $$;

create table if not exists uploaded_documents (
  id uuid primary key default gen_random_uuid(),
  owner_profile_id uuid,
  organization_id uuid,
  quote_id uuid references quotes (id) on delete cascade,
  order_id uuid references orders (id) on delete set null,
  bucket text not null default 'documents',
  path text not null,
  filename text not null,
  mime text not null,
  purpose document_purpose not null default 'rfq',
  created_at timestamptz not null default now()
);

create index if not exists uploaded_documents_quote_idx on uploaded_documents (quote_id);
create unique index if not exists uploaded_documents_path_unique on uploaded_documents (bucket, path);

alter table uploaded_documents enable row level security;
