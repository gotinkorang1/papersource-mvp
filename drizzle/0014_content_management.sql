create table if not exists public.content_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 1 and 160),
  description text not null check (char_length(description) between 1 and 320),
  body text not null check (char_length(body) between 1 and 100000),
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists content_pages_status_idx on public.content_pages(status);

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null check (char_length(question) between 1 and 240),
  answer text not null check (char_length(answer) between 1 and 5000),
  position integer not null default 0 check (position >= 0),
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists faqs_status_position_idx on public.faqs(status, position);

create table if not exists public.navigation_items (
  id uuid primary key default gen_random_uuid(),
  label text not null check (char_length(label) between 1 and 80),
  href text not null check (href ~ '^(/|https?://)'),
  placement text not null check (placement in ('header', 'footer', 'mobile')),
  position integer not null default 0 check (position >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists navigation_items_placement_active_idx on public.navigation_items(placement, active, position);

alter table public.content_pages enable row level security;
alter table public.faqs enable row level security;
alter table public.navigation_items enable row level security;

drop policy if exists "published pages are publicly readable" on public.content_pages;
create policy "published pages are publicly readable" on public.content_pages for select to anon, authenticated using (status = 'published');
drop policy if exists "published faqs are publicly readable" on public.faqs;
create policy "published faqs are publicly readable" on public.faqs for select to anon, authenticated using (status = 'published');
drop policy if exists "active navigation is publicly readable" on public.navigation_items;
create policy "active navigation is publicly readable" on public.navigation_items for select to anon, authenticated using (active = true);
