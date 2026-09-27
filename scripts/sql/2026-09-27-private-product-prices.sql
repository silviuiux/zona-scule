-- ════════════════════════════════════════════════════════════════════════════
-- 2026-09-27 — Real product prices out of public reach
-- ════════════════════════════════════════════════════════════════════════════
-- Applied to Supabase project dfbhgnbqwoinujnzfxsl as three migrations:
--   private_product_prices_store, public_price_becomes_order_rank,
--   price_rank_not_null_safe. This file is the record of the final state.
--
-- Why: products.price held the acquisition (cost) price and the anon role —
-- whose key is public — could SELECT it on products, product_listing and
-- product_listing_mv.
--
-- Now:
--   • private.product_prices           real prices (schema not exposed by the API)
--   • private.products_price_backup_20260927   snapshot taken before the swap
--   • public.products.price            SORT RANK only: lowest real price → 0.01,
--                                      next distinct price → 0.02, … (ties share)
--   • Any real price written to products.price (scripts, imports, SQL) is moved
--     into private.product_prices by triggers; the public value keeps/gets a rank.
--   • refresh_product_listing() re-applies exact ranks, then refreshes the MV.
--   • get_product_cost_prices(uuid[])  real prices for trusted tooling —
--                                      EXECUTE granted to service_role only.

-- ── 1. Private store + backup (non-destructive) ─────────────────────────────
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to service_role;

create table if not exists private.product_prices (
  product_id uuid primary key
    references public.products(id) on delete cascade
    deferrable initially deferred,
  price numeric(10,2) not null,
  updated_at timestamptz not null default now()
);
revoke all on private.product_prices from public, anon, authenticated;
grant select, insert, update, delete on private.product_prices to service_role;
create index if not exists product_prices_price_idx on private.product_prices (price);

create table if not exists private.products_price_backup_20260927 as
  select id as product_id, sku, name, brand_name, price, now() as backed_up_at
  from public.products;
revoke all on private.products_price_backup_20260927 from public, anon, authenticated;
grant select on private.products_price_backup_20260927 to service_role;

insert into private.product_prices (product_id, price)
select id, price from public.products where price is not null
on conflict (product_id) do update set price = excluded.price, updated_at = now();

-- ── 2. Rank maintenance ─────────────────────────────────────────────────────
create or replace function private.apply_price_order()
returns integer language plpgsql security definer set search_path = '' as $$
declare
  changed integer;
  prev text := coalesce(current_setting('app.price_order_refresh', true), 'off');
begin
  perform set_config('app.price_order_refresh', 'on', true);
  with ranked as (
    select product_id, round(dense_rank() over (order by price) * 0.01, 2) as rank_price
    from private.product_prices
  )
  update public.products p set price = r.rank_price
    from ranked r
   where r.product_id = p.id and p.price is distinct from r.rank_price;
  get diagnostics changed = row_count;
  perform set_config('app.price_order_refresh', prev, true);
  return changed;
end $$;

-- Provisional rank for a new product: rank of the closest price at or below it.
create or replace function private.provisional_price_rank(p_price numeric, p_exclude uuid)
returns numeric language sql stable security definer set search_path = '' as $$
  select coalesce((
    select p.price from private.product_prices pp
    join public.products p on p.id = pp.product_id
    where pp.price <= p_price and pp.product_id <> p_exclude
    order by pp.price desc limit 1
  ), 0.01)
$$;

-- UPDATE of price (incl. INSERT … ON CONFLICT DO UPDATE): store, keep rank.
create or replace function private.capture_product_price_update()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if coalesce(current_setting('app.price_order_refresh', true), 'off') = 'on' then
    return new;
  end if;
  if new.price is distinct from old.price then
    if new.price is null then
      delete from private.product_prices where product_id = new.id;
    else
      insert into private.product_prices (product_id, price) values (new.id, new.price)
      on conflict (product_id) do update set price = excluded.price, updated_at = now();
    end if;
    new.price := old.price;
  end if;
  return new;
end $$;

-- INSERT: store, then give the row a provisional rank (price is NOT NULL).
create or replace function private.capture_product_price_insert()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  prev text := coalesce(current_setting('app.price_order_refresh', true), 'off');
begin
  if prev = 'on' then return null; end if;
  insert into private.product_prices (product_id, price) values (new.id, new.price)
  on conflict (product_id) do update set price = excluded.price, updated_at = now();
  perform set_config('app.price_order_refresh', 'on', true);
  update public.products set price = private.provisional_price_rank(new.price, new.id) where id = new.id;
  perform set_config('app.price_order_refresh', prev, true);
  return null;
end $$;

revoke all on function private.apply_price_order() from public, anon, authenticated;
revoke all on function private.provisional_price_rank(numeric, uuid) from public, anon, authenticated;
revoke all on function private.capture_product_price_update() from public, anon, authenticated;
revoke all on function private.capture_product_price_insert() from public, anon, authenticated;

create trigger trg_capture_product_price_update
  before update of price on public.products
  for each row execute function private.capture_product_price_update();
create trigger trg_capture_product_price_insert
  after insert on public.products
  for each row execute function private.capture_product_price_insert();

create or replace function public.refresh_product_listing()
returns void language plpgsql security definer
set search_path to 'public' set statement_timeout to '120s' set lock_timeout to '30s' as $$
begin
  perform private.apply_price_order();
  refresh materialized view concurrently public.product_listing_mv;
  analyze public.product_listing_mv;
end $$;

create or replace function public.get_product_cost_prices(p_ids uuid[] default null)
returns table (product_id uuid, sku text, name text, brand_name text, price numeric)
language sql stable security definer set search_path = '' as $$
  select p.id, p.sku::text, p.name::text, p.brand_name::text, pp.price
  from private.product_prices pp join public.products p on p.id = pp.product_id
  where p_ids is null or pp.product_id = any (p_ids)
  order by pp.product_id
$$;
revoke all on function public.get_product_cost_prices(uuid[]) from public, anon, authenticated;
grant execute on function public.get_product_cost_prices(uuid[]) to service_role;

-- ── 3. The swap ─────────────────────────────────────────────────────────────
select private.apply_price_order();
select public.refresh_product_listing();

-- ── Checks (all passed on 2026-09-27) ───────────────────────────────────────
-- order preserved (expect 0):
--   select count(*) from (select dense_rank() over (order by pp.price) a, round(p.price*100) b
--     from public.products p join private.product_prices pp on pp.product_id = p.id) t where a <> b;
-- anon can't read costs (expect false):
--   select has_function_privilege('anon', 'public.get_product_cost_prices(uuid[])', 'EXECUTE');

-- ── Rollback (restores real prices into products.price — public again!) ─────
--   drop trigger trg_capture_product_price_update on public.products;
--   drop trigger trg_capture_product_price_insert on public.products;
--   update public.products p set price = pp.price
--     from private.product_prices pp where pp.product_id = p.id;
--   -- and restore refresh_product_listing() without the apply_price_order() call
--   select public.refresh_product_listing();
