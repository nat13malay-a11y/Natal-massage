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

insert into public.portfolio_cards (id, media, text, created_at)
values
(
  '11111111-1111-4111-8111-111111111111',
  '{"kind":"image","src":"/assets/IMG_1217.gif","source":"url","name":"IMG_1217.gif"}'::jsonb,
  $json$
  {
    "uk": {
      "tag": "ДЦП",
      "patient": "Дитина, 6 років",
      "title": "Повернення руху",
      "description": "Хлопчик із діагнозом ДЦП не міг самостійно ходити й контролювати рухи рук. Після курсу нейрометодики вдалося відновити рухову функцію: дитина почала ходити без підтримки та виконувати точні рухи руками.",
      "metricOneValue": "8",
      "metricOneLabel": "місяців роботи",
      "metricTwoValue": "100%",
      "metricTwoLabel": "ходить сам",
      "quote": "Методика Наталії Борисівни дала нам те, про що ми боялися навіть мріяти"
    },
    "ru": {
      "tag": "ДЦП",
      "patient": "Ребёнок, 6 лет",
      "title": "Возвращение движения",
      "description": "Мальчик с диагнозом ДЦП не мог самостоятельно ходить и контролировать движения рук. После курса нейрометодики удалось восстановить двигательную функцию: ребёнок начал ходить без поддержки и выполнять точные движения руками.",
      "metricOneValue": "8",
      "metricOneLabel": "месяцев работы",
      "metricTwoValue": "100%",
      "metricTwoLabel": "ходит сам",
      "quote": "Методика Натальи Борисовны дала нам то, о чём мы боялись даже мечтать"
    },
    "en": {
      "tag": "CP",
      "patient": "Child, 6 years old",
      "title": "Movement Recovery",
      "description": "A child with cerebral palsy could not walk independently or control hand movements. After the neuromethod course, motor function improved: the child began walking without support and making precise hand movements.",
      "metricOneValue": "8",
      "metricOneLabel": "months of work",
      "metricTwoValue": "100%",
      "metricTwoLabel": "walks alone",
      "quote": "Natalia Borysivna’s method gave us something we were afraid to even dream about"
    }
  }
  $json$::jsonb,
  '2026-06-22T00:03:00.000Z'
),
(
  '22222222-2222-4222-8222-222222222222',
  '{"kind":"image","src":"/assets/strabismus-result.jpg","source":"url","name":"strabismus-result.jpg"}'::jsonb,
  $json$
  {
    "uk": {
      "tag": "Вроджена косоокість",
      "patient": "Дівчинка, 9 років",
      "title": "Перемога над косоокістю",
      "description": "Дівчинка з вираженою косоокістю: одне око відхилялося на 30°. Хірургічне лікування не дало результату. Завдяки нейрометодиці вдалося нормалізувати м’язовий тонус ока — косоокість зникла без операції.",
      "metricOneValue": "4",
      "metricOneLabel": "місяці курсу",
      "metricTwoValue": "0°",
      "metricTwoLabel": "відхилення",
      "quote": "Косоокість зникла без повторної операції"
    },
    "ru": {
      "tag": "Врождённое косоглазие",
      "patient": "Девочка, 9 лет",
      "title": "Победа над косоглазием",
      "description": "Девочка с выраженным косоглазием: один глаз отклонялся на 30°. Хирургическое лечение не дало результата. Благодаря нейрометодике удалось нормализовать мышечный тонус глаза — косоглазие исчезло без операции.",
      "metricOneValue": "4",
      "metricOneLabel": "месяца курса",
      "metricTwoValue": "0°",
      "metricTwoLabel": "отклонение",
      "quote": "Косоглазие исчезло без повторной операции"
    },
    "en": {
      "tag": "Congenital strabismus",
      "patient": "Girl, 9 years old",
      "title": "Overcoming Strabismus",
      "description": "A girl had pronounced strabismus: one eye deviated by 30 degrees. Surgery did not help. The neuromethod helped normalize eye muscle tone, and the strabismus disappeared without another operation.",
      "metricOneValue": "4",
      "metricOneLabel": "months of course",
      "metricTwoValue": "0°",
      "metricTwoLabel": "deviation",
      "quote": "The strabismus disappeared without another operation"
    }
  }
  $json$::jsonb,
  '2026-06-22T00:02:00.000Z'
),
(
  '33333333-3333-4333-8333-333333333333',
  '{"kind":"image","src":"/assets/parkinsons-result.jpg","source":"url","name":"parkinsons-result.jpg"}'::jsonb,
  $json$
  {
    "uk": {
      "tag": "Хвороба Паркінсона",
      "patient": "Індивідуальна програма",
      "title": "Робота з хворобою Паркінсона",
      "description": "При хворобі Паркінсона робота будується через відновлення зв’язку тіла й нервової системи: пальпація, м’який вплив, зниження м’язового напруження та поступове повернення контролю рухів.",
      "metricOneValue": "1:1",
      "metricOneLabel": "підхід",
      "metricTwoValue": "15+",
      "metricTwoLabel": "років практики",
      "quote": "М’яка робота допомагає поступово повертати контроль рухів"
    },
    "ru": {
      "tag": "Болезнь Паркинсона",
      "patient": "Индивидуальная программа",
      "title": "Работа с болезнью Паркинсона",
      "description": "При болезни Паркинсона работа строится через восстановление связи тела и нервной системы: пальпация, мягкое воздействие, снижение мышечного напряжения и постепенное возвращение контроля движений.",
      "metricOneValue": "1:1",
      "metricOneLabel": "подход",
      "metricTwoValue": "15+",
      "metricTwoLabel": "лет практики",
      "quote": "Мягкая работа помогает постепенно возвращать контроль движений"
    },
    "en": {
      "tag": "Parkinson’s disease",
      "patient": "Individual program",
      "title": "Working with Parkinson’s Disease",
      "description": "With Parkinson’s disease, the work focuses on restoring the connection between the body and nervous system: palpation, gentle influence, reducing muscle tension, and gradually returning movement control.",
      "metricOneValue": "1:1",
      "metricOneLabel": "approach",
      "metricTwoValue": "15+",
      "metricTwoLabel": "years practice",
      "quote": "Gentle work helps gradually return movement control"
    }
  }
  $json$::jsonb,
  '2026-06-22T00:01:00.000Z'
)
on conflict (id) do update
set
  media = excluded.media,
  text = excluded.text,
  created_at = excluded.created_at;

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
