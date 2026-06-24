-- Zona Scule rebuild — schema migration #1
-- Run once in the Supabase SQL editor for this project (dfbhgnbqwoinujnzfxsl).
-- Additive and idempotent (CREATE TABLE IF NOT EXISTS / CREATE OR REPLACE
-- FUNCTION) — safe to re-run.

-- 1. contact_messages -------------------------------------------------------
-- Did not exist on `main` (confirmed via a live REST probe — 404 on
-- /rest/v1/contact_messages). The contact form previously only updated local
-- React state; this is what it now writes to.
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nume text not null,
  email text not null,
  telefon text,
  companie text,
  produs text,
  mesaj text not null
);

alter table public.contact_messages enable row level security;

-- Anyone (anon) can submit the public contact form...
drop policy if exists "contact_messages_insert_anon" on public.contact_messages;
create policy "contact_messages_insert_anon"
  on public.contact_messages
  for insert
  to anon
  with check (true);

-- ...but only the service role can read them back (no public select policy
-- is created for anon/authenticated, so reads require the admin/service key).

-- 2. articles (Zona Soluții) ------------------------------------------------
-- Moves Zona Soluții content off the static app/zona-solutii/articles.ts
-- array on `main` and into Supabase, per the recommendation in
-- docs/REBUILD.md §7 — editable without a code deploy.
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  slug text not null unique,
  profession text not null,
  title text not null,
  excerpt text not null,
  body_html text not null,
  cover_gradient text,
  tag text,
  read_minutes int,
  product_filter jsonb not null default '{}'::jsonb,
  published_at timestamptz
);

alter table public.articles enable row level security;

drop policy if exists "articles_select_public" on public.articles;
create policy "articles_select_public"
  on public.articles
  for select
  to anon, authenticated
  using (true);

-- 3. Family-aware RPC counts -------------------------------------------------
-- These RPCs previously counted individual SKUs, not product families,
-- so e.g. PFERD (16k+ SKU rows, far fewer actual product families) wildly
-- over-counted in every sidebar/pill. Switched to
-- count(distinct coalesce(family_id, id)) so counts match what the
-- family-rollup `product_listing` view actually displays as one card.
-- get_featured_subcategories_with_image() is intentionally left untouched —
-- its current body isn't captured anywhere in the app repo, and it isn't
-- named in the over-count follow-up note in REBUILD.md §5.3.

create or replace function public.count_products_by_brand()
returns table(brand_name text, cnt bigint)
language sql
stable
as $$
  select brand_name, count(distinct coalesce(family_id, id::text)) as cnt
  from public.products
  where brand_name is not null
  group by brand_name
  order by brand_name;
$$;

create or replace function public.count_products_by_category()
returns table(category_text text, cnt bigint)
language sql
stable
as $$
  select category_text, count(distinct coalesce(family_id, id::text)) as cnt
  from public.products
  where category_text is not null
  group by category_text
  order by category_text;
$$;

create or replace function public.count_products_by_subcategory()
returns table(subcategory_text text, cnt bigint)
language sql
stable
as $$
  select subcategory_text, count(distinct coalesce(family_id, id::text)) as cnt
  from public.products
  where subcategory_text is not null
  group by subcategory_text
  order by subcategory_text;
$$;

create or replace function public.get_brands_by_filter(
  p_category text default null,
  p_subcategory text default null,
  p_search text default null
)
returns table(brand_name text, cnt bigint)
language sql
stable
as $$
  select brand_name, count(distinct coalesce(family_id, id::text)) as cnt
  from public.products
  where brand_name is not null
    and (p_category is null or category_text = p_category)
    and (p_subcategory is null or subcategory_text = p_subcategory)
    and (p_search is null or p_search = '' or search_vector @@ to_tsquery('simple', p_search))
  group by brand_name
  order by brand_name;
$$;

create or replace function public.get_subcategories_by_brand(p_brand text default null)
returns table(subcategory_text text, cnt bigint)
language sql
stable
as $$
  select subcategory_text, count(distinct coalesce(family_id, id::text)) as cnt
  from public.products
  where subcategory_text is not null
    and (p_brand is null or brand_name = p_brand)
  group by subcategory_text
  order by subcategory_text;
$$;

grant execute on function public.count_products_by_brand() to anon, authenticated;
grant execute on function public.count_products_by_category() to anon, authenticated;
grant execute on function public.count_products_by_subcategory() to anon, authenticated;
grant execute on function public.get_brands_by_filter(text, text, text) to anon, authenticated;
grant execute on function public.get_subcategories_by_brand(text) to anon, authenticated;

-- 4. Tighten RLS on catalog tables to read-only for anon/authenticated -------
-- REBUILD.md §5.5: the working assumption on `main` was that the anon key
-- could write directly to `products`/`subcategories` (no auth gate on
-- /admin or /api/update-product-category meant this was the *only* thing
-- stopping arbitrary writes via the anon key, app-layer auth aside). Now
-- that the rebuild's admin writes go exclusively through the service-role
-- client (lib/supabase/admin.ts, behind hasValidAdminSession()), anon/
-- authenticated should be select-only here — otherwise someone could still
-- write directly against PostgREST with the public anon key, bypassing the
-- app's auth entirely. Run this after confirming the admin panel works
-- end-to-end with the service-role key, since it removes the anon
-- write access the old app relied on.
alter table public.products enable row level security;
alter table public.subcategories enable row level security;
alter table public.categories enable row level security;
alter table public.brands enable row level security;

drop policy if exists "products_select_public" on public.products;
create policy "products_select_public" on public.products
  for select to anon, authenticated using (true);

drop policy if exists "subcategories_select_public" on public.subcategories;
create policy "subcategories_select_public" on public.subcategories
  for select to anon, authenticated using (true);

drop policy if exists "categories_select_public" on public.categories;
create policy "categories_select_public" on public.categories
  for select to anon, authenticated using (true);

drop policy if exists "brands_select_public" on public.brands;
create policy "brands_select_public" on public.brands
  for select to anon, authenticated using (true);

-- No insert/update/delete policies for anon/authenticated on any of the four
-- tables above — only the service-role key (which bypasses RLS entirely)
-- can write, and that key is never exposed to the browser.
