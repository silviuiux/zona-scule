-- 2026-09-28 — counts for the /produse multi-select pill filters
-- Applied to Supabase project dfbhgnbqwoinujnzfxsl as migration
-- catalog_multi_filter_counts. Additive only (two new read-only functions);
-- same row rules as get_brands_by_filter / count_products_by_category.

create or replace function public.get_categories_by_brands(p_brands text[] default null, p_search text default null)
returns table(category_text text, cnt bigint)
language sql stable
as $$
  select category_text, count(*) as cnt
  from public.product_listing_mv
  where category_text is not null
    and slug is not null
    and (main_image_storage_url is not null or main_image_url is not null)
    and (p_brands is null or cardinality(p_brands) = 0 or brand_name = any(p_brands))
    and (p_search is null or p_search = '' or search_vector @@ to_tsquery('simple', p_search))
  group by category_text
  order by category_text;
$$;

create or replace function public.get_brands_by_categories(p_categories text[] default null, p_subcategory text default null, p_search text default null)
returns table(brand_name text, cnt bigint)
language sql stable
as $$
  select brand_name, count(*) as cnt
  from public.product_listing_mv
  where brand_name is not null
    and slug is not null
    and (main_image_storage_url is not null or main_image_url is not null)
    and (p_categories is null or cardinality(p_categories) = 0 or category_text = any(p_categories))
    and (p_subcategory is null or subcategory_text = p_subcategory)
    and (p_search is null or p_search = '' or search_vector @@ to_tsquery('simple', p_search))
  group by brand_name
  order by brand_name;
$$;

grant execute on function public.get_categories_by_brands(text[], text) to anon, authenticated, service_role;
grant execute on function public.get_brands_by_categories(text[], text, text) to anon, authenticated, service_role;
