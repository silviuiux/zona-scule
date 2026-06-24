import { supabaseServer } from "@/lib/supabase/server";
import type {
  Category,
  CategoryCount,
  Subcategory,
  SubcategoryCount,
  FeaturedSubcategory,
} from "@/lib/types";

export async function getAllCategories(): Promise<Category[]> {
  const { data, error } = await supabaseServer
    .from("categories")
    .select("id, slug, name, hero_image_url, description, featured, sort_order")
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Category[];
}

/** Categories joined with live product counts via `count_products_by_category` RPC. */
export async function getCategoriesWithCount(): Promise<
  (Category & { count: number })[]
> {
  const [categories, counts] = await Promise.all([
    getAllCategories(),
    supabaseServer.rpc("count_products_by_category"),
  ]);

  if (counts.error) throw counts.error;
  const countRows = (counts.data ?? []) as CategoryCount[];
  const countMap = new Map(countRows.map((row) => [row.category_text, Number(row.cnt)]));

  return categories.map((category) => ({
    ...category,
    count: countMap.get(category.name) ?? 0,
  }));
}

export async function getAllSubcategoriesWithCount(): Promise<
  (Subcategory & { count: number })[]
> {
  const [{ data: subcategories, error: subError }, counts] = await Promise.all([
    supabaseServer
      .from("subcategories")
      .select("id, slug, name, parent_category_id, description, icon_url, sort_order")
      .order("sort_order", { ascending: true, nullsFirst: false })
      .order("name", { ascending: true }),
    supabaseServer.rpc("count_products_by_subcategory"),
  ]);

  if (subError) throw subError;
  if (counts.error) throw counts.error;

  const countRows = (counts.data ?? []) as SubcategoryCount[];
  const countMap = new Map(countRows.map((row) => [row.subcategory_text, Number(row.cnt)]));

  return ((subcategories ?? []) as Subcategory[]).map((sub) => ({
    ...sub,
    count: countMap.get(sub.name) ?? 0,
  }));
}

/** Subcategories scoped to one brand, with counts, via `get_subcategories_by_brand` RPC. */
export async function getSubcategoriesByBrandName(
  brandName: string
): Promise<SubcategoryCount[]> {
  const { data, error } = await supabaseServer.rpc("get_subcategories_by_brand", {
    p_brand: brandName,
  });

  if (error) throw error;
  return (data ?? []) as SubcategoryCount[];
}

export async function getFeaturedSubcategoriesWithImage(): Promise<FeaturedSubcategory[]> {
  const { data, error } = await supabaseServer.rpc("get_featured_subcategories_with_image");
  if (error) throw error;
  return (data ?? []) as FeaturedSubcategory[];
}

export type SubcategoryPill = {
  name: string;
  count: number;
  parent_category_id: string | null;
};

/**
 * Subcategory pill bar source, per REBUILD.md §3.2: scoped to the active
 * brand (via the `get_subcategories_by_brand` RPC, so counts stay
 * filter-accurate) and/or active category (filtered by `parent_category_id`
 * against the local `subcategories` table — there's no RPC for
 * category-scoped subcategory counts, so this reuses the catalog-wide
 * `count_products_by_subcategory` numbers, which is correct since
 * subcategory names don't repeat across categories).
 */
export async function getSubcategoryPills(params: {
  brandName?: string;
  categoryId?: string;
}): Promise<SubcategoryPill[]> {
  const { brandName, categoryId } = params;

  if (brandName) {
    const [brandScoped, { data: allSubs, error }] = await Promise.all([
      getSubcategoriesByBrandName(brandName),
      supabaseServer.from("subcategories").select("name, parent_category_id"),
    ]);
    if (error) throw error;

    const parentByName = new Map(
      ((allSubs ?? []) as { name: string; parent_category_id: string | null }[]).map((s) => [
        s.name,
        s.parent_category_id,
      ])
    );

    return brandScoped
      .map((row) => ({
        name: row.subcategory_text,
        count: Number(row.cnt),
        parent_category_id: parentByName.get(row.subcategory_text) ?? null,
      }))
      .filter((row) => !categoryId || row.parent_category_id === categoryId);
  }

  const all = await getAllSubcategoriesWithCount();
  return all
    .filter((sub) => !categoryId || sub.parent_category_id === categoryId)
    .map((sub) => ({
      name: sub.name,
      count: sub.count,
      parent_category_id: sub.parent_category_id,
    }));
}
