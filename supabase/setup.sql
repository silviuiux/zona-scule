-- ============================================================
-- Zona Scule — Supabase security & contact form setup
-- Run once in the Supabase SQL editor (Dashboard → SQL).
-- ============================================================

-- 1. CONTACT MESSAGES table (wired to /contact form)
create table if not exists public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  nume        text not null,
  email       text not null,
  telefon     text,
  companie    text,
  produs      text,
  mesaj       text not null,
  source_url  text
);

alter table public.contact_messages enable row level security;
-- No anon policies: only the service role (server) can read/write.

-- 2. LOCK DOWN catalog tables: public = read-only.
--    The site reads with the anon key; all writes go through the
--    server with the service key (admin actions / API routes).
alter table public.products       enable row level security;
alter table public.brands         enable row level security;
alter table public.categories     enable row level security;
alter table public.subcategories  enable row level security;

drop policy if exists "public read products"      on public.products;
drop policy if exists "public read brands"        on public.brands;
drop policy if exists "public read categories"    on public.categories;
drop policy if exists "public read subcategories" on public.subcategories;

create policy "public read products"      on public.products      for select using (true);
create policy "public read brands"        on public.brands        for select using (true);
create policy "public read categories"    on public.categories    for select using (true);
create policy "public read subcategories" on public.subcategories for select using (true);

-- IMPORTANT: do NOT create insert/update/delete policies for anon.
-- The service role bypasses RLS, so admin actions keep working.

-- 3. Verify (should list rowsecurity = true for all):
-- select tablename, rowsecurity from pg_tables where schemaname = 'public';
