import { redirect } from 'next/navigation'
import { hasValidAdminSession } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import CatalogClient, { type CatalogProduct, type CatOption, type SubOption } from './CatalogClient'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 50

const SELECT_COLUMNS = [
  'id', 'slug', 'brand_name', 'sku', 'name', 'model',
  'short_description', 'long_description',
  'category_id', 'category_text', 'subcategory_id', 'subcategory_text',
  'st1_label', 'st1_value', 'st1_details',
  'st2_label', 'st2_value', 'st2_details',
  'st3_label', 'st3_value', 'st3_details',
  'manufacturer_url', 'family_name',
].join(',')

type SP = { page?: string; q?: string; brand?: string; categorie?: string }

export default async function CatalogPage({ searchParams }: { searchParams: Promise<SP> }) {
  // Same authoritative gate as every other /admin page — proxy.ts is UX, not
  // the security boundary.
  if (!(await hasValidAdminSession())) redirect('/admin/login?next=/admin/catalog')

  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1)
  const q = sp.q?.trim() ?? ''
  const brand = sp.brand ?? ''
  const categorie = sp.categorie ?? ''

  let query = supabase
    .from('products')
    .select(SELECT_COLUMNS, { count: 'exact' })
    .order('name')
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

  if (brand) query = query.eq('brand_name', brand)
  if (categorie) query = query.eq('category_text', categorie)
  if (q) {
    const esc = q.replace(/[%_]/g, m => `\\${m}`)
    query = query.or(
      `name.ilike.%${esc}%,sku.ilike.%${esc}%,brand_name.ilike.%${esc}%,model.ilike.%${esc}%`
    )
  }

  const [
    { data: products, error, count },
    { data: categories },
    { data: subcategories },
    { data: brands },
  ] = await Promise.all([
    query,
    supabase.from('categories').select('id, name').order('sort_order', { ascending: true, nullsFirst: false }),
    supabase.from('subcategories').select('id, name, parent_category_id').order('name'),
    supabase.from('brands').select('name').order('name'),
  ])

  if (error) throw error

  return (
    <CatalogClient
      products={(products ?? []) as unknown as CatalogProduct[]}
      total={count ?? 0}
      page={page}
      pageSize={PAGE_SIZE}
      categories={(categories ?? []) as CatOption[]}
      subcategories={(subcategories ?? []) as SubOption[]}
      brandNames={(brands ?? []).map(b => b.name as string)}
      initialFilters={{ q, brand, categorie }}
    />
  )
}
