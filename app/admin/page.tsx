import { createClient } from '@supabase/supabase-js'
import AdminClient from './AdminClient'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const [{ data: subcats }, { data: categories }] = await Promise.all([
    supabase
      .from('subcategories')
      .select(`
        id, name, slug, parent_category_id,
        categories!parent_category_id ( name )
      `)
      .order('name'),
    supabase
      .from('categories')
      .select('id, name')
      .order('sort_order'),
  ])

  // Get product counts per subcategory
  const { data: counts } = await supabase.rpc('count_products_by_subcategory')

  const countMap: Record<string, number> = {}
  for (const row of (counts as { subcategory_text: string; cnt: number }[] ?? [])) {
    if (row.subcategory_text) countMap[row.subcategory_text.toLowerCase().trim()] = row.cnt
  }

  const enriched = (subcats ?? []).map((s: any) => ({
    id: s.id,
    name: s.name,
    slug: s.slug ?? null,
    parent_category_id: s.parent_category_id,
    category_name: s.categories?.name ?? '—',
    product_count: countMap[s.name.toLowerCase().trim()] ?? 0,
  }))

  return (
    <AdminClient
      subcategories={enriched}
      categories={(categories ?? []) as { id: string; name: string }[]}
    />
  )
}
