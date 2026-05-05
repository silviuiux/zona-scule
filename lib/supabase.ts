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
    .select('*', { count: 'exact' })
    .not('slug', 'is', null)
    .not('main_image_storage_url', 'is', null)
    .order('name')
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (brandName) query = query.ilike('brand_name', brandName)
  if (categoryText) query = query.ilike('category_text', categoryText)
  if (subcategoryText) query = query.ilike('subcategory_text', subcategoryText)
  if (search) query = query.ilike('name', `%${search}%`)
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

export async function getBrands() {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('name')
  if (error) throw error
  return data as Brand[]
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
  const [{ data: cats, error }, { data: counts, error: cErr }] = await Promise.all([
    supabase.from('categories').select('*').order('sort_order', { ascending: true, nullsFirst: false }),
    supabase.from('products').select('category_id').not('category_id', 'is', null),
  ])
  if (error) throw error
  if (cErr) throw cErr

  const countMap: Record<string, number> = {}
  for (const row of counts ?? []) {
    if (row.category_id) countMap[row.category_id] = (countMap[row.category_id] ?? 0) + 1
  }

  return (cats as Category[]).map(c => ({ ...c, product_count: countMap[c.id] ?? 0 }))
}
