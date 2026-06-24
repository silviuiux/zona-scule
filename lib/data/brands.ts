import { supabaseServer } from "@/lib/supabase/server";
import { buildTsQuery } from "@/lib/search";
import type { Brand, BrandCount } from "@/lib/types";

/** All brand rows (name/slug/logo), independent of counts. */
export async function getAllBrands(): Promise<Brand[]> {
  const { data, error } = await supabaseServer
    .from("brands")
    .select("id, slug, name, logo_url, brand_color, country, short_description, featured")
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Brand[];
}

/**
 * Catalog-wide brand counts via the `count_products_by_brand` RPC — never a
 * client-side `.select(..., { count })`, which PostgREST caps at 1000 rows
 * (REBUILD.md §4).
 */
export async function getBrandCounts(): Promise<BrandCount[]> {
  const { data, error } = await supabaseServer.rpc("count_products_by_brand");
  if (error) throw error;
  return (data ?? []) as BrandCount[];
}

/**
 * Brand counts scoped to the active category/subcategory/search filter, via
 * the `get_brands_by_filter` RPC, so the sidebar's brand counts stay in sync
 * with whatever the user has already filtered on.
 */
export async function getBrandsByFilter(filter: {
  categoryText?: string;
  subcategoryText?: string;
  search?: string;
}): Promise<BrandCount[]> {
  const tsq = filter.search ? buildTsQuery(filter.search) : null;

  const { data, error } = await supabaseServer.rpc("get_brands_by_filter", {
    p_category: filter.categoryText ?? null,
    p_subcategory: filter.subcategoryText ?? null,
    p_search: tsq,
  });

  if (error) throw error;
  return (data ?? []) as BrandCount[];
}
