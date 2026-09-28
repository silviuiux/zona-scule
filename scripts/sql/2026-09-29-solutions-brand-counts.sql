-- 2026-09-29 — per-brand product counts over a set of subcategories, for the
-- /zona-solutii story heroes (products + brands relevant to a profession).
-- Applied to Supabase project dfbhgnbqwoinujnzfxsl as migration
-- solutions_brand_counts. Additive only (one new read-only function); same
-- row rules as the /produse listing (slug set, has an image).

create or replace function public.get_brands_by_subcategories(p_subcategories text[])
returns table(brand_name text, cnt bigint)
language sql stable
as $$
  select brand_name, count(*) as cnt
  from public.product_listing_mv
  where brand_name is not null
    and slug is not null
    and (main_image_storage_url is not null or main_image_url is not null)
    and subcategory_text = any(p_subcategories)
  group by brand_name
  order by cnt desc;
$$;

grant execute on function public.get_brands_by_subcategories(text[]) to anon, authenticated, service_role;
