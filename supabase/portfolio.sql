create extension if not exists "pgcrypto";

create table if not exists public.portfolio_cards (
  id uuid primary key default gen_random_uuid(),
  media jsonb not null default '{"kind":"none","src":"","source":"none"}'::jsonb,
  text jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists portfolio_cards_set_updated_at on public.portfolio_cards;

create trigger portfolio_cards_set_updated_at
before update on public.portfolio_cards
for each row
execute function public.set_updated_at();

alter table public.portfolio_cards enable row level security;

drop policy if exists "portfolio_cards_select_all" on public.portfolio_cards;
drop policy if exists "portfolio_cards_insert_all" on public.portfolio_cards;
drop policy if exists "portfolio_cards_update_all" on public.portfolio_cards;
drop policy if exists "portfolio_cards_delete_all" on public.portfolio_cards;

create policy "portfolio_cards_select_all"
on public.portfolio_cards
for select
to anon, authenticated
using (true);

create policy "portfolio_cards_insert_all"
on public.portfolio_cards
for insert
to anon, authenticated
with check (true);

create policy "portfolio_cards_update_all"
on public.portfolio_cards
for update
to anon, authenticated
using (true)
with check (true);

create policy "portfolio_cards_delete_all"
on public.portfolio_cards
for delete
to anon, authenticated
using (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio-media',
  'portfolio-media',
  true,
  52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "portfolio_media_select_all" on storage.objects;
drop policy if exists "portfolio_media_insert_all" on storage.objects;
drop policy if exists "portfolio_media_update_all" on storage.objects;
drop policy if exists "portfolio_media_delete_all" on storage.objects;

create policy "portfolio_media_select_all"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'portfolio-media');

create policy "portfolio_media_insert_all"
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'portfolio-media');

create policy "portfolio_media_update_all"
on storage.objects
for update
to anon, authenticated
using (bucket_id = 'portfolio-media')
with check (bucket_id = 'portfolio-media');

create policy "portfolio_media_delete_all"
on storage.objects
for delete
to anon, authenticated
using (bucket_id = 'portfolio-media');

create table if not exists public.site_analytics_sessions (
  id text primary key,
  visitor_id text not null,
  source text not null default 'site',
  entry_path text not null default '/',
  last_path text not null default '/',
  referrer text,
  user_agent text,
  started_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  duration_seconds integer not null default 0,
  page_views integer not null default 1,
  max_scroll_depth integer not null default 0,
  is_returning boolean not null default false,
  read_score integer not null default 0,
  accidental boolean not null default true,
  client jsonb not null default '{}'::jsonb
);

alter table public.site_analytics_sessions enable row level security;

drop policy if exists "site_analytics_select_all" on public.site_analytics_sessions;
drop policy if exists "site_analytics_insert_all" on public.site_analytics_sessions;
drop policy if exists "site_analytics_update_all" on public.site_analytics_sessions;

create policy "site_analytics_select_all"
on public.site_analytics_sessions
for select
to anon, authenticated
using (true);

create policy "site_analytics_insert_all"
on public.site_analytics_sessions
for insert
to anon, authenticated
with check (true);

create policy "site_analytics_update_all"
on public.site_analytics_sessions
for update
to anon, authenticated
using (true)
with check (true);
