import { supabaseServer } from "@/lib/supabase/server";
import { buildTsQuery } from "@/lib/search";
import type { Product, ProductListingRow, ProductFilter } from "@/lib/types";

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export type GetProductsParams = ProductFilter & {
  page?: number;
  pageSize?: number;
};

export type GetProductsResult = {
  products: ProductListingRow[];
  page: number;
  pageSize: number;
  hasMore: boolean;
};

/**
 * Reads the `product_listing` view (family/variant rollup — one card per
 * family) with AND-ed exact-match filters, full-text search via
 * `search_vector`, and offset pagination. Per REBUILD.md §4: the catalog is
 * ordered alphabetically by name by default, except the unfiltered/no-search
 * default view, where each page's row set (still fetched in stable
 * name order, so "load more" never duplicates/skips rows) is shuffled
 * client-of-the-DB-side before being returned.
 */
export async function getProducts(params: GetProductsParams): Promise<GetProductsResult> {
  const { page = 1, pageSize = 24, brandName, categoryText, subcategoryText, search } = params;

  let query = supabaseServer.from("product_listing").select("*");

  if (brandName) query = query.eq("brand_name", brandName);
  if (categoryText) query = query.eq("category_text", categoryText);
  if (subcategoryText) query = query.eq("subcategory_text", subcategoryText);

  const tsq = search ? buildTsQuery(search) : null;
  if (tsq) {
    query = query.textSearch("search_vector", tsq, { config: "simple" });
  } else {
    query = query.order("name", { ascending: true, nullsFirst: false });
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error } = await query;
  if (error) throw error;

  let products = (data ?? []) as ProductListingRow[];

  const isDefaultUnfilteredView = !brandName && !categoryText && !subcategoryText && !tsq;
  if (isDefaultUnfilteredView) {
    products = shuffle(products);
  }

  return {
    products,
    page,
    pageSize,
    hasMore: products.length === pageSize,
  };
}

/**
 * Detail page lookup. Deliberately reads the raw `products` table, not
 * `product_listing` — the view's null-filters on slug/storage-image hide
 * incomplete rows from the catalog grid, but direct-link access should
 * always work (this is the fix for the PFERD-invisible-family bug class
 * described in REBUILD.md §5.2: the listing can omit a row without the
 * detail page ever being affected).
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabaseServer
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return (data as Product) ?? null;
}

/**
 * Sibling variants in the same family (e.g. PFERD dimension variants),
 * excluding the current product itself.
 */
export async function getProductVariants(
  familyId: string,
  excludeSlug?: string
): Promise<Product[]> {
  let query = supabaseServer
    .from("products")
    .select("*")
    .eq("family_id", familyId)
    .order("variant_label", { ascending: true, nullsFirst: false })
    .order("name", { ascending: true });

  if (excludeSlug) query = query.neq("slug", excludeSlug);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Product[];
}

/**
 * Prev/next navigation at the family level within a subcategory — uses
 * `product_listing` so sibling variants are skipped (each family counts
 * once), per REBUILD.md §3.3.
 */
export async function getAdjacentProducts(
  slug: string,
  subcategoryText: string | null
): Promise<{ prev: ProductListingRow | null; next: ProductListingRow | null }> {
  if (!subcategoryText) return { prev: null, next: null };

  const { data, error } = await supabaseServer
    .from("product_listing")
    .select("*")
    .eq("subcategory_text", subcategoryText)
    .order("name", { ascending: true, nullsFirst: false });

  if (error) throw error;

  const rows = (data ?? []) as ProductListingRow[];
  const index = rows.findIndex((row) => row.slug === slug);
  if (index === -1) return { prev: null, next: null };

  return {
    prev: index > 0 ? rows[index - 1] : null,
    next: index < rows.length - 1 ? rows[index + 1] : null,
  };
}
