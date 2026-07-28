import { createClient } from '@supabase/supabase-js'
import { unstable_cache } from 'next/cache'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─── Types ────────────────────────────────────────────────────────────────────

export type Product = {
  id: string
  slug: string
  name: string
  sku: string | null
  brand_id: string | null
  brand_name: string | null
  model: string | null
  short_description: string | null
  category_id: string | null
  category_text: string | null
  subcategory_id: string | null
  subcategory_text: string | null
  main_image_url: string | null
  main_image_storage_url: string | null
  gallery_url_1: string | null
  gallery_url_2: string | null
  gallery_url_3: string | null
  gallery_url_4: string | null
  status: string | null
  featured: boolean
  st1_label: string | null
  st1_value: string | null
  st1_details: string | null
  st2_label: string | null
  st2_value: string | null
  st2_details: string | null
  st3_label: string | null
  st3_value: string | null
  st3_details: string | null
  c1_title: string | null
  c1_details: string | null
  c2_title: string | null
  c2_details: string | null
  c3_title: string | null
  c3_details: string | null
  app_01_title: string | null
  app_01_details: string | null
  app_02_title: string | null
  app_02_details: string | null
  app_03_title: string | null
  app_03_details: string | null
  gallery_storage_url_1: string | null
  gallery_storage_url_2: string | null
  gallery_storage_url_3: string | null
  gallery_storage_url_4: string | null
  images_migrated: boolean
  manufacturer_url: string | null
  created_at: string | null
  // Acquisition/cost price (see lib/quote-pricing.ts) — added to
  // product_listing/product_listing_mv 2026-07-11 specifically so the
  // storefront listing can sort by it (see getProducts' default order).
  price: number | null
  // ── PFERD variants (additive migration) ──
  family_id: string | null
  family_name: string | null
  variant_label: string | null
  variant_count?: number          // present on product_listing rows
  ean: string | null
  long_description: string | null
  special_features: string | null
  applications: string | null
  datasheet_url_1: string | null
  datasheet_url_2: string | null
  specs: Record<string, string> | null
  axes: Record<string, string> | null
  enriched: boolean
}

export type Brand = {
  id: string
  slug: string | null
  name: string
  logo_url: string | null
  brand_color: string | null
  country: string | null
  short_description: string | null
  featured: boolean
}

export type Category = {
  id: string
  slug: string | null
  name: string
  hero_image_url: string | null
  description: string | null
  featured: boolean
  sort_order: number | null
}

export type Subcategory = {
  id: string
  slug: string | null
  name: string
  parent_category_id: string | null
  description: string | null
  icon_url: string | null
  sort_order: number | null
}

// ─── Query helpers ─────────────────────────────────────────────────────────────

export async function getProducts({
  page = 1,
  pageSize = 24,
  brandName,
  categoryText,
  subcategoryText,
  search,
  featured,
}: {
  page?: number
  pageSize?: number
  brandName?: string
  categoryText?: string
  subcategoryText?: string
  search?: string
  featured?: boolean
} = {}) {
  // product_listing = one row per family (representative variant); products with
  // no family fall back to themselves, so nothing is hidden. 'exact' because
  // estimated counts are unreliable on a view.
  //
  // Image requirement is "has ANY image", not "has a migrated storage image" —
  // requiring main_image_storage_url specifically hid whole batches (e.g. the
  // FFGroup import) that only have the original supplier main_image_url and
  // haven't been through the storage-migration script yet. ProductCard already
  // falls back to main_image_url when the storage copy is absent.
  //
  // This image requirement is deliberately SKIPPED when `search` is set: a
  // no-image product (e.g. the 2026 Milwaukee price-list batch, inserted
  // ahead of their image migration) should still be findable by exact name/SKU
  // search, it just shouldn't show up when someone is casually browsing a
  // category/subcategory grid with no search term.
  //
  // Sort order (2026-07-11): price descending — most expensive first — is
  // now the single global rule for every listing view (replaced the old
  // per-view mix of alphabetical order, "Toate" merchandising tiers, and a
  // brand/category shuffle; see "sorting order rules july 11.md" for what
  // used to be here). `name` is just the tiebreak for equal/NULL prices.
  let query = supabase
    .from('product_listing_mv')
    // Narrowed from select('*') 2026-07-29: the grid only ever renders
    // ProductCard, which reads exactly these columns (id is needed for the
    // React `key`). This view has ~65 columns incl. long_description,
    // specs/axes jsonb, and datasheet URLs that a 24-row listing page never
    // touches — those are still fetched in full on the product detail page.
    // Still count: 'exact', deliberately not 'estimated' — see the note
    // above this function; estimates on a filtered materialized-view query
    // are unreliable.
    .select(
      'id, slug, name, model, sku, brand_name, short_description, main_image_storage_url, main_image_url, gallery_url_1, st1_label, st1_value, st2_label, st2_value, price, featured, category_text, subcategory_text',
      { count: 'exact' }
    )
    .not('slug', 'is', null)
    .order('price', { ascending: false, nullsFirst: false })
    .order('name')
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (!search) {
    query = query.or('main_image_storage_url.not.is.null,main_image_url.not.is.null')
  }

  if (brandName) query = query.eq('brand_name', brandName)
  if (categoryText) query = query.eq('category_text', categoryText)
  if (subcategoryText) query = query.eq('subcategory_text', subcategoryText)
  if (search) {
    // Use the generated `search_vector` tsvector column with the existing GIN
    // index (`products_search_idx`). Build a prefix tsquery so partial words
    // ("scul" → "scule", "bos" → "bosch") still match. Tokens are AND-ed.
    const tsq = search
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map(t => t.replace(/[!&|()'":\\<>*]/g, '') + ':*')
      .filter(t => t.length > 2) // drop empty after sanitizing
      .join(' & ')
    if (tsq) {
      query = query.textSearch('search_vector', tsq, { config: 'ro_unaccent' })
    }
  }
  if (featured) query = query.eq('featured', true)

  const { data, error, count } = await query
  if (error) throw error
  return { products: data as Product[], total: count ?? 0 }
}

// ─── "Toate" merchandising order (SUPERSEDED 2026-07-11) ──────────────────
// getHomeProducts() below is no longer called anywhere — the fully-
// unfiltered "Toate" view now goes through plain getProducts() like every
// other view, so it gets the same global price-descending order. Left
// defined (unused) rather than deleted in case the tiering is wanted back;
// full behavior is documented in "sorting order rules july 11.md".
//
// The fully-unfiltered /produse listing ("Toate", no brand/category/
// subcategory/search) prioritizes three business-picked groups ahead of
// everything else, in this order:
//   1) Aspiratoare — every vacuum-cleaner subcategory under Curatenie
//   2) Scule electrice — the whole category
//   3) The rest of Curatenie — cleaning machines/appliances not already
//      counted as "aspiratoare" above (split into two tiers internally to
//      correctly include the rare product with no subcategory at all — see
//      HOME_TIER_FILTERS)
//   4) Everything else
// Ordering is alphabetical (by name) *within* each tier, not shuffled — the
// tiers are stitched together purely by offset math (see below), which only
// stays correct across "Load more" pages if each tier's own order is stable
// between requests.
const HOME_VACUUM_SUBCATS = [
  'Aspiratoare casnice',
  'Aspiratoare industriale',
  'Aspiratoare de geamuri',
  'Aspiratoare umed-uscat (NT)',
  'Aspiratoare uscate (T)',
]

/** Quote+escape a list of values for a raw PostgREST `in.(...)` filter literal
 *  (needed for `.not(col, 'in', ...)`, which — unlike `.in()` — takes a raw
 *  string instead of auto-escaping an array). Always double-quoting is safe
 *  even for values with no special characters, and required for the ones
 *  that contain parentheses (e.g. "Aspiratoare umed-uscat (NT)"). */
function toPgListLiteral(values: string[]) {
  return `(${values.map(v => `"${v.replace(/"/g, '""')}"`).join(',')})`
}

function homeBaseQuery() {
  return supabase
    .from('product_listing_mv')
    .select('*', { count: 'exact' })
    .not('slug', 'is', null)
    .or('main_image_storage_url.not.is.null,main_image_url.not.is.null')
    .order('name')
}

// `any` here (rather than ReturnType<typeof homeBaseQuery>) sidesteps a
// TS2589 "type instantiation excessively deep" error — the Postgrest
// builder's generics don't hold up well through this many chained calls
// inside an array of functions. Runtime behavior is unaffected either way.
const HOME_TIER_FILTERS: Array<(q: any) => any> = [
  // Tier 0: aspiratoare
  q => q.in('subcategory_text', HOME_VACUUM_SUBCATS),
  // Tier 1: Scule electrice
  q => q.eq('category_text', 'Scule electrice'),
  // Tier 2: rest of Curatenie, excluding aspiratoare (non-null subcategory
  // case only — kept as a single `.not(...in...)` rather than folding an
  // `.or()` on top of the base query's own `.or()` for the image filter.
  // Stacking two `.or()` calls on one query is a real PostgREST pattern but
  // wasn't practical to verify against the live API from this sandbox
  // (network egress to Supabase's REST endpoint is blocked here), so tier 2b
  // below picks up the tiny NULL-subcategory edge case with a plain `.is()`
  // filter instead — no ambiguity, no reliance on unverified composition.
  q => q.eq('category_text', 'Curatenie')
        .not('subcategory_text', 'is', null)
        .not('subcategory_text', 'in', toPgListLiteral(HOME_VACUUM_SUBCATS)),
  // Tier 2b: Curatenie rows with no subcategory at all (currently ~1 row) —
  // would otherwise silently vanish from "Toate" (NULL fails both `in` and
  // `not in` under 3-valued SQL logic), so it gets its own tiny tier.
  q => q.eq('category_text', 'Curatenie').is('subcategory_text', null),
  // Tier 3: everything else
  q => q.not('category_text', 'in', toPgListLiteral(['Scule electrice', 'Curatenie'])),
]

/** Overlap of [reqStart,reqEnd) with [tierStart,tierEnd) as *local* (tier-
 *  relative) [start,end) indices, or null if there's no overlap. */
function tierOverlap(
  reqStart: number, reqEnd: number, tierStart: number, tierEnd: number
): [number, number] | null {
  const start = Math.max(reqStart, tierStart)
  const end = Math.min(reqEnd, tierEnd)
  return start < end ? [start - tierStart, end - tierStart] : null
}

export async function getHomeProducts({
  page = 1,
  pageSize = 24,
}: { page?: number; pageSize?: number } = {}) {
  // Count each tier up front so we know its slot in the merged sequence.
  // Cheap head-only queries — no rows fetched, just counts.
  const counts = await Promise.all(
    HOME_TIER_FILTERS.map(async filter => {
      const { count, error } = await filter(
        supabase
          .from('product_listing_mv')
          .select('*', { count: 'exact', head: true })
          .not('slug', 'is', null)
          .or('main_image_storage_url.not.is.null,main_image_url.not.is.null') as any
      )
      if (error) throw error
      return count ?? 0
    })
  )

  const total = counts.reduce((a, b) => a + b, 0)
  const reqStart = (page - 1) * pageSize
  const reqEnd = reqStart + pageSize

  // Walk the tiers in priority order, fetching whichever local slice of each
  // tier overlaps this page's [reqStart, reqEnd) window in the merged
  // sequence. A page only ever spans 2 tiers in practice (each tier here has
  // well over a page's worth of products), but the loop handles any split.
  const chunks: Product[][] = []
  let tierStart = 0
  for (let i = 0; i < HOME_TIER_FILTERS.length; i++) {
    const tierEnd = tierStart + counts[i]
    const overlap = tierOverlap(reqStart, reqEnd, tierStart, tierEnd)
    if (overlap) {
      const [localStart, localEnd] = overlap
      const { data, error } = await HOME_TIER_FILTERS[i](homeBaseQuery()).range(localStart, localEnd - 1)
      if (error) throw error
      chunks.push((data ?? []) as Product[])
    }
    tierStart = tierEnd
  }

  return { products: chunks.flat(), total }
}

export async function getProductBySlug(slug: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) return null
  return data as Product
}

export type VariantOption = {
  slug: string
  sku: string | null
  name: string | null
  variant_label: string | null
  specs: Record<string, string> | null
  ean: string | null
}

/** Sibling variants in the same family (for the PDP variant dropdown). */
export async function getProductVariants(familyId: string): Promise<VariantOption[]> {
  const { data } = await supabase
    .from('products')
    .select('slug, sku, name, variant_label, specs, ean')
    .eq('family_id', familyId)
    .order('variant_label', { nullsFirst: false })
  return (data ?? []) as VariantOption[]
}

/**
 * Every sibling variant in a family, as full Product rows — used by the PDP
 * variant carousel (needs images/specs/brand for ProductCard, not just the
 * slim fields getProductVariants selects for the dropdown). Only images
 * required is deliberately NOT enforced here: a variant missing an image
 * shouldn't silently vanish from its own family's carousel the way it would
 * from a browse listing.
 */
export async function getFamilyVariantsFull(familyId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('family_id', familyId)
    .order('variant_label', { nullsFirst: false })
  if (error || !data) return []
  return data as Product[]
}

export async function getAdjacentProducts(
  currentSlug: string,
  subcategoryText: string | null | undefined
): Promise<{ prevSlug: string | null; nextSlug: string | null }> {
  // Get current product's name for cursor-based ordering
  const { data: cur } = await supabase
    .from('products')
    .select('name')
    .eq('slug', currentSlug)
    .single()
  if (!cur) return { prevSlug: null, nextSlug: null }

  const base = () => {
    let q = supabase
      .from('product_listing_mv')   // family-level: prev/next skips sibling variants
      .select('slug')
      .not('slug', 'is', null)
      .or('main_image_storage_url.not.is.null,main_image_url.not.is.null')
    if (subcategoryText) q = q.eq('subcategory_text', subcategoryText)
    return q
  }

  const [{ data: prevData }, { data: nextData }] = await Promise.all([
    base().lt('name', cur.name).order('name', { ascending: false }).limit(1),
    base().gt('name', cur.name).order('name', { ascending: true }).limit(1),
  ])

  return {
    prevSlug: (prevData?.[0]?.slug as string) ?? null,
    nextSlug: (nextData?.[0]?.slug as string) ?? null,
  }
}

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true, nullsFirst: false })
  if (error) throw error
  return data as Category[]
}

/**
 * Single brand row by slug — powers flagship brand landing pages
 * (app/brand/[slug]), which need the brand's logo/color/description without
 * pulling the whole getBrands() list + counts just to find one row.
 */
export async function getBrandBySlug(slug: string): Promise<Brand | null> {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()
  if (error || !data) return null
  return data as Brand
}

export type ApplicationGroup = { title: string; count: number; products: Product[] }

/**
 * Groups a brand's products by their primary application/use-case label
 * (`app_01_title` — e.g. "Aeroporturi și porturi", "Turnătorii", "Logistică
 * și depozitare" on enriched Karcher rows; see scripts/enrich-karcher.mjs).
 * Powers the "Găsește scula potrivită pentru lucrarea ta" carousels on brand
 * landing pages — this mirrors how a professional buyer actually searches
 * (by job, not by category or SKU), and costs nothing extra to build: the
 * data is already there from the enrichment pipeline, no admin curation
 * needed.
 *
 * Not every brand has this field populated yet (PFERD's catalog, for
 * instance, is enriched from a hand-written nomenclature blueprint instead —
 * see extras/karcher_nomenclature_blueprint.md and app/brand/pferd) — brands
 * without app_01_title data simply return an empty array and the template
 * omits the section.
 *
 * Implementation note: groups client-side over one brand-scoped fetch rather
 * than a dedicated SQL RPC (no `group_products_by_application` function
 * exists yet). Counts reflect the sampled page only, not the true brand-wide
 * total — fine at current brand sizes and cached via the page's ISR window;
 * if a brand's catalog grows enough for this to matter, add an RPC mirroring
 * `count_products_by_subcategory` instead.
 */
export async function getApplicationGroupsByBrand(
  brandName: string,
  { maxGroups = 6, perGroup = 10, sampleSize = 500 }:
    { maxGroups?: number; perGroup?: number; sampleSize?: number } = {}
): Promise<ApplicationGroup[]> {
  const { products } = await getProducts({ brandName, pageSize: sampleSize })

  const byTitle = new Map<string, Product[]>()
  for (const p of products) {
    const title = p.app_01_title?.trim()
    if (!title) continue
    const arr = byTitle.get(title) ?? []
    arr.push(p)
    byTitle.set(title, arr)
  }

  return Array.from(byTitle.entries())
    .map(([title, all]) => ({ title, count: all.length, products: all.slice(0, perGroup) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, maxGroups)
}

/**
 * Groups a brand's products by `subcategory_text` — the universal counterpart
 * to getApplicationGroupsByBrand() above. Every brand has subcategory_text
 * populated (it's a core catalog field, not an enrichment extra like
 * app_01_title), so this is what powers the "Descoperă pe subcategorii"
 * carousel section on brand pages that lack rich application data — which is
 * most of them (Osborn has 0/131 app_01_title rows, Ruko only 47/470, PFERD's
 * enrichment predates that field entirely). Karcher and Milwaukee have both
 * app_01_title AND diverse subcategories; useUseCaseCarousels (job-based) and
 * useSubcategoryCarousels (catalog-structure-based) are independent flags in
 * BrandPageConfig so a brand can show either, both, or neither.
 *
 * Same sampling caveat as getApplicationGroupsByBrand: groups/counts reflect
 * one brand-scoped fetch (sampleSize rows), not a true brand-wide count.
 */
export async function getSubcategoryGroupsByBrand(
  brandName: string,
  { maxGroups = 6, perGroup = 10, sampleSize = 500 }:
    { maxGroups?: number; perGroup?: number; sampleSize?: number } = {}
): Promise<ApplicationGroup[]> {
  const { products } = await getProducts({ brandName, pageSize: sampleSize })

  const byTitle = new Map<string, Product[]>()
  for (const p of products) {
    const title = p.subcategory_text?.trim()
    if (!title) continue
    const arr = byTitle.get(title) ?? []
    arr.push(p)
    byTitle.set(title, arr)
  }

  return Array.from(byTitle.entries())
    .map(([title, all]) => ({ title, count: all.length, products: all.slice(0, perGroup) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, maxGroups)
}

export type BrandWithCount = Brand & { product_count: number }

/** Returns all brands with at least 1 product across the whole catalogue. */
export async function getBrands(): Promise<BrandWithCount[]> {
  const [{ data: brands, error }, { data: counts, error: cErr }] = await Promise.all([
    supabase.from('brands').select('*').order('name'),
    supabase.rpc('count_products_by_brand'),
  ])
  if (error) throw error

  // Lowercase+trim keys — matches the pattern already used for categories/
  // subcategories, so a brands.name/products.brand_name casing mismatch (e.g.
  // "Pferd" vs "PFERD") can't silently drop a brand from the sidebar again.
  const countMap: Record<string, number> = {}
  for (const row of (counts as { brand_name: string; cnt: number }[] ?? [])) {
    if (row.brand_name) countMap[row.brand_name.toLowerCase().trim()] = row.cnt
  }

  return (brands as Brand[])
    .map(b => ({ ...b, product_count: countMap[b.name.toLowerCase().trim()] ?? 0 }))
    .filter(b => b.product_count > 0)
    .sort((a, b) => b.product_count - a.product_count)
}

/**
 * Returns brands that have ≥1 product matching the current listing filters.
 * Used to populate the sidebar brands section with context-aware counts.
 */
export async function getBrandsByFilter({
  categoryText,
  subcategoryText,
  search,
}: {
  categoryText?: string
  subcategoryText?: string
  search?: string
} = {}): Promise<BrandWithCount[]> {
  const [{ data: brands, error }, { data: counts }] = await Promise.all([
    supabase.from('brands').select('*').order('name'),
    supabase.rpc('get_brands_by_filter', {
      p_category:    categoryText    ?? null,
      p_subcategory: subcategoryText ?? null,
      p_search:      search          ?? null,
    }),
  ])
  if (error || !brands) return []

  // Same lowercase+trim normalization as getBrands() — see comment there.
  const countMap: Record<string, number> = {}
  for (const row of (counts as { brand_name: string; cnt: number }[] ?? [])) {
    if (row.brand_name) countMap[row.brand_name.toLowerCase().trim()] = row.cnt
  }

  return (brands as Brand[])
    .filter(b => (countMap[b.name.toLowerCase().trim()] ?? 0) > 0)
    .map(b => ({ ...b, product_count: countMap[b.name.toLowerCase().trim()] }))
    .sort((a, b) => b.product_count - a.product_count)
}

export async function getSubcategoriesByCategory(categoryId: string) {
  const { data, error } = await supabase
    .from('subcategories')
    .select('*')
    .eq('parent_category_id', categoryId)
    .order('sort_order', { ascending: true, nullsFirst: false })
  if (error) throw error
  return data as Subcategory[]
}

export type CategoryWithCount = Category & { product_count: number }

// 2026-07-29: wrapped in a 60s cache — this is fetched unconditionally on
// every single /produse and homepage load regardless of filters, but the
// category list + per-category counts only actually change a few times a
// day (catalog imports / product_listing_mv refresh), not per-request.
export const getCategoriesWithCount = unstable_cache(
  async (): Promise<CategoryWithCount[]> => {
  // Use rpc to get counts directly in DB — avoids 1000-row Supabase default limit
  const [{ data: cats, error }, { data: counts, error: cErr }] = await Promise.all([
    supabase.from('categories').select('*').order('sort_order', { ascending: true, nullsFirst: false }),
    supabase.rpc('count_products_by_category'),
  ])
  if (error) throw error
  if (cErr) {
    // Fallback: return categories with 0 counts if RPC not available
    return (cats as Category[]).map(c => ({ ...c, product_count: 0 }))
  }

  const countMap: Record<string, number> = {}
  for (const row of (counts as { category_text: string; cnt: number }[] ?? [])) {
    if (row.category_text) {
      countMap[row.category_text.toLowerCase().trim()] = row.cnt
    }
  }

  return (cats as Category[]).map(c => ({
    ...c,
    product_count: countMap[c.name.toLowerCase().trim()] ?? 0,
  }))
  },
  ['get-categories-with-count'],
  { revalidate: 60, tags: ['catalog'] }
)

export type SubcategoryWithCount = Subcategory & { product_count: number }

// 2026-07-29: same reasoning/cache window as getCategoriesWithCount above —
// fetched unconditionally on every /produse load, changes rarely.
export const getAllSubcategoriesWithCount = unstable_cache(
  async (): Promise<SubcategoryWithCount[]> => {
  const [{ data: subs, error }, { data: counts }] = await Promise.all([
    supabase.from('subcategories').select('*').order('name'),
    supabase.rpc('count_products_by_subcategory'),
  ])
  if (error || !subs) return []

  const countMap: Record<string, number> = {}
  for (const row of (counts as { subcategory_text: string; cnt: number }[] ?? [])) {
    if (row.subcategory_text) countMap[row.subcategory_text.toLowerCase().trim()] = row.cnt
  }

  // Dedupe by name — see the matching comment in getSubcategoriesByBrandName:
  // 63 subcategory names legitimately exist as 2-3 rows (same name, different
  // parent_category_id), and count_products_by_subcategory groups by name
  // only, so without this every duplicate row rendered as its own identical
  // pill in the unfiltered "Toate" bar.
  const seen = new Set<string>()
  return (subs as Subcategory[])
    .filter(s => {
      const key = s.name.toLowerCase().trim()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .map(s => ({ ...s, product_count: countMap[s.name.toLowerCase().trim()] ?? 0 }))
    .filter(s => s.product_count > 0)
    .sort((a, b) => b.product_count - a.product_count)
  },
  ['get-all-subcategories-with-count'],
  { revalidate: 60, tags: ['catalog'] }
)

/**
 * Site-wide "total produse" figure shown in the homepage hero, the /produse
 * hero + "Toate" pill, and the sidebar — a single raw row count from
 * `products` (every SKU/variant), matching what /admin/status shows.
 *
 * Deliberately NOT the family-deduped, image-filtered count that
 * `product_listing_mv` gives (that's a *smaller*, "browsable cards" number —
 * fewer than this because variants collapse into one family and rows without
 * an image are excluded). Product decision: always show the biggest true
 * number, consistently, everywhere — not a number that depends on which
 * page happens to query which table.
 */
// 2026-07-29: was a plain, uncached `count(*) from products` run fresh on
// every /produse + homepage hit — measured at 3.36s live (visibility-map
// bloat, fixed separately with a VACUUM). Even vacuumed, this is a full-
// table count for a number that's purely decorative and doesn't need to
// be exact to the row, so: 'estimated' (planner stats, not a real scan)
// plus a 60s cache so at most one request a minute actually reaches
// Postgres for it, no matter how much traffic hits the page.
export const getRawProductCount = unstable_cache(
  async (): Promise<number> => {
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'estimated', head: true })
    return count ?? 0
  },
  ['get-raw-product-count'],
  { revalidate: 60, tags: ['catalog'] }
)

export async function getSubcategoriesByBrandName(brandName: string): Promise<SubcategoryWithCount[]> {
  const [{ data: subs, error }, { data: counts }] = await Promise.all([
    supabase.from('subcategories').select('*').order('name'),
    supabase.rpc('get_subcategories_by_brand', { p_brand: brandName }),
  ])
  if (error || !subs) return []

  const countMap: Record<string, number> = {}
  for (const row of (counts as { subcategory_text: string; cnt: number }[] ?? [])) {
    if (row.subcategory_text) countMap[row.subcategory_text.toLowerCase().trim()] = row.cnt
  }

  // Dedupe by name: 63 subcategory names (e.g. "Fixare", "Force Logic",
  // "Debitare și decupare") legitimately exist as 2-3 separate rows in the
  // `subcategories` table — same name, different parent_category_id, because
  // that subcategory genuinely sits under more than one category (see the
  // similar note in getSubcategoriesByCategoryName). get_subcategories_by_brand
  // groups its counts by subcategory_text only (not per-row/per-category), so
  // every one of those duplicate rows was getting mapped to the SAME count
  // and rendered as a separate pill — "Fixare 650" showing twice, "Debitare
  // și decupare 607" three times, etc. in the brand-filtered pill bar. Since
  // the count is already a per-name total, keeping just one row per name
  // (first hit, alphabetical from the `order('name')` above) fixes the
  // duplicate pills without changing any counts.
  const seen = new Set<string>()
  return (subs as Subcategory[])
    .filter(s => {
      const key = s.name.toLowerCase().trim()
      if (seen.has(key)) return false
      seen.add(key)
      return (countMap[key] ?? 0) > 0
    })
    .map(s => ({ ...s, product_count: countMap[s.name.toLowerCase().trim()] }))
    .sort((a, b) => b.product_count - a.product_count)
}

export type FeaturedSubcategoryWithImage = {
  id: string
  name: string
  slug: string | null
  parent_category_id: string | null
  category_name?: string | null   // enriched in page.tsx from categories list
  product_count: number
  image_url: string | null
}

export async function getFeaturedSubcategoriesWithImage(): Promise<FeaturedSubcategoryWithImage[]> {
  const { data, error } = await supabase.rpc('get_featured_subcategories_with_image')
  if (error || !data) return []
  return data as FeaturedSubcategoryWithImage[]
}

export type SuperviewGroup = { category: string; products: Product[] }
export type SuperviewFilterOption = { name: string; count: number }

/**
 * Powers /produse/superview: exactly one representative product per unique
 * (brand, category, subcategory) combination site-wide — a "one of each"
 * overview rather than the full catalogue. The actual dedup/selection logic
 * (featured first, then price desc, then name — same tiebreak convention as
 * getProducts()) lives in the `get_superview_products()` Postgres function
 * so it's a single indexed query instead of N+1 fetches per combo.
 *
 * "Necategorizat" is filtered out here (not in the SQL function, to keep
 * that function reusable/generic) — same catch-all bucket already hidden
 * from the sidebar category list in app/produse/page.tsx.
 *
 * Filters (brandName/categoryText/subcategoryText) narrow the SAME
 * already-deduped superview set — e.g. picking a brand shows one product
 * per category/subcategory *within that brand only*, not a re-run of the
 * dedup against the brand's full catalogue. The whole ~500-row set is small
 * enough that this filters in memory rather than adding filter params to the
 * SQL function; no extra round trip.
 */
export async function getSuperviewProducts({
  brandName,
  categoryText,
  subcategoryText,
}: {
  brandName?: string
  categoryText?: string
  subcategoryText?: string
} = {}): Promise<{
  groups: SuperviewGroup[]
  totalProducts: number
  brandCount: number
  categoryCount: number
  filters: {
    brands: SuperviewFilterOption[]
    categories: SuperviewFilterOption[]
    subcategories: SuperviewFilterOption[]
  }
}> {
  const empty = {
    groups: [], totalProducts: 0, brandCount: 0, categoryCount: 0,
    filters: { brands: [], categories: [], subcategories: [] },
  }
  const { data, error } = await supabase.rpc('get_superview_products')
  if (error || !data) return empty

  const allProducts = (data as Product[]).filter(
    p => (p.category_text ?? '').toLowerCase().trim() !== 'necategorizat'
  )

  // Dropdown option lists always come from the FULL unfiltered superview set
  // (picking a brand shouldn't make other brands vanish from the brand
  // dropdown) — subcategory options are the one exception: scoped to
  // whichever brand/category is currently selected, matching the cascading
  // convention the main /produse dropdowns already use (CategoryPillBar.tsx).
  const countByKey = (key: 'brand_name' | 'category_text', products: Product[]): SuperviewFilterOption[] => {
    const counts = new Map<string, number>()
    for (const p of products) {
      const val = p[key]
      if (!val) continue
      counts.set(val, (counts.get(val) ?? 0) + 1)
    }
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }

  const subScope = allProducts.filter(p =>
    (!brandName || p.brand_name === brandName) && (!categoryText || p.category_text === categoryText)
  )
  const subCounts = new Map<string, number>()
  for (const p of subScope) {
    if (!p.subcategory_text) continue
    subCounts.set(p.subcategory_text, (subCounts.get(p.subcategory_text) ?? 0) + 1)
  }

  const filters = {
    brands: countByKey('brand_name', allProducts),
    categories: countByKey('category_text', allProducts),
    subcategories: Array.from(subCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
  }

  const products = allProducts.filter(p =>
    (!brandName || p.brand_name === brandName) &&
    (!categoryText || p.category_text === categoryText) &&
    (!subcategoryText || p.subcategory_text === subcategoryText)
  )

  const byCategory = new Map<string, Product[]>()
  for (const p of products) {
    const cat = p.category_text ?? 'Alte produse'
    const arr = byCategory.get(cat) ?? []
    arr.push(p)
    byCategory.set(cat, arr)
  }

  const groups = Array.from(byCategory.entries())
    .map(([category, prods]) => ({
      category,
      products: prods.sort((a, b) => (a.subcategory_text ?? '').localeCompare(b.subcategory_text ?? '')),
    }))
    .sort((a, b) => b.products.length - a.products.length)

  return {
    groups,
    totalProducts: products.length,
    brandCount: new Set(products.map(p => p.brand_name)).size,
    categoryCount: groups.length,
    filters,
  }
}

export async function getSubcategoriesByCategoryName(categoryName: string): Promise<SubcategoryWithCount[]> {
  // Step 1: resolve category id (and canonical name — categoryName as typed
  // in the URL may differ in case from the stored category_text values, and
  // p_category below needs an exact match against product_listing_mv).
  const { data: cat } = await supabase
    .from('categories')
    .select('id, name')
    .ilike('name', categoryName)
    .single()

  if (!cat) return []

  // Step 2: get the authoritative subcategory list from the subcategories table.
  // This is the source of truth — the RPC alone can return stale subcategory_text
  // strings from products that are no longer associated with this category.
  const { data: subs, error: subsErr } = await supabase
    .from('subcategories')
    .select('*')
    .eq('parent_category_id', cat.id)
    .order('sort_order', { ascending: true, nullsFirst: false })

  if (subsErr || !subs || subs.length === 0) return []

  // Step 3: count products per subcategory_text, scoped to this category via
  // p_category. Several subcategory names (e.g. "Fixare", "Force Logic",
  // "Beton") exist under more than one category, so an unscoped count here
  // would add both categories' totals together — that's the bug that made a
  // subcategory pill show a bigger number than the category's own "Toate"
  // pill. Passing p_category filters count_products_by_subcategory to just
  // this category's products before grouping.
  const { data: rpcData } = await supabase.rpc('count_products_by_subcategory', { p_category: cat.name })

  const countByName: Record<string, number> = {}
  if (rpcData) {
    for (const row of rpcData as { subcategory_text: string; cnt: number }[]) {
      if (row.subcategory_text) countByName[row.subcategory_text.toLowerCase().trim()] = row.cnt
    }
  }

  // Step 4: return only subcategories that exist in the table, with their counts.
  // Any product subcategory_text that has no matching row in the table is ignored.
  return (subs as Subcategory[])
    .map(s => ({
      ...s,
      product_count: countByName[s.name.toLowerCase().trim()] ?? 0,
    }))
    .filter(s => s.product_count > 0)
    .sort((a, b) => b.product_count - a.product_count)
}
