import { createClient } from '@supabase/supabase-js'

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
  let query = supabase
    .from('products')
    .select('*', { count: 'estimated' })
    .not('slug', 'is', null)
    .not('main_image_storage_url', 'is', null)
    .order('name')
    .range((page - 1) * pageSize, page * pageSize - 1)

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
      query = query.textSearch('search_vector', tsq, { config: 'simple' })
    }
  }
  if (featured) query = query.eq('featured', true)

  const { data, error, count } = await query
  if (error) throw error
  return { products: data as Product[], total: count ?? 0 }
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

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true, nullsFirst: false })
  if (error) throw error
  return data as Category[]
}

export type BrandWithCount = Brand & { product_count: number }

export async function getBrands(): Promise<BrandWithCount[]> {
  const [{ data: brands, error }, { data: counts, error: cErr }] = await Promise.all([
    supabase.from('brands').select('*').order('name'),
    supabase.rpc('count_products_by_brand'),
  ])
  if (error) throw error

  const countMap: Record<string, number> = {}
  for (const row of (counts as { brand_name: string; cnt: number }[] ?? [])) {
    if (row.brand_name) countMap[row.brand_name] = row.cnt
  }

  return (brands as Brand[])
    .map(b => ({ ...b, product_count: countMap[b.name] ?? 0 }))
    .filter(b => b.product_count > 0)
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

export async function getCategoriesWithCount(): Promise<CategoryWithCount[]> {
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
}

export type SubcategoryWithCount = Subcategory & { product_count: number }

export async function getAllSubcategoriesWithCount(): Promise<SubcategoryWithCount[]> {
  const [{ data: subs, error }, { data: counts }] = await Promise.all([
    supabase.from('subcategories').select('*').order('name'),
    supabase.rpc('count_products_by_subcategory'),
  ])
  if (error || !subs) return []

  const countMap: Record<string, number> = {}
  for (const row of (counts as { subcategory_text: string; cnt: number }[] ?? [])) {
    if (row.subcategory_text) countMap[row.subcategory_text.toLowerCase().trim()] = row.cnt
  }

  return (subs as Subcategory[])
    .map(s => ({ ...s, product_count: countMap[s.name.toLowerCase().trim()] ?? 0 }))
    .filter(s => s.product_count > 0)
    .sort((a, b) => b.product_count - a.product_count)
}

export async function getSubcategoriesByCategoryName(categoryName: string): Promise<SubcategoryWithCount[]> {
  // Step 1: resolve category id
  const { data: cat } = await supabase
    .from('categories')
    .select('id')
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

  // Step 3: get product counts via RPC (keyed by subcategory name so we can
  // cross-reference, regardless of whether the RPC returns extra rows).
  const { data: rpcData } = await supabase.rpc('get_subcategories_with_count', {
    cat_id: cat.id,
  })

  const countByName: Record<string, number> = {}
  if (rpcData) {
    for (const row of rpcData as { name: string; product_count: number }[]) {
      if (row.name) countByName[row.name.toLowerCase().trim()] = row.product_count
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
