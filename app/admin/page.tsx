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
        id, name, parent_category_id,
        categories!parent_category_id ( name )
      `)
      .order('name'),
    supabase
      .from('categories')
      .select('id, name')
      .order('sort_order'),
  ])

  // Get product counts per subcategory
  const { data: counts } = await supabase.rpc('get_all_subcategories_with_count')

  const countMap: Record<string, number> = {}
  for (const row of counts ?? []) {
    countMap[row.id] = row.product_count
  }

  const enriched = (subcats ?? []).map((s: any) => ({
    id: s.id,
    name: s.name,
    parent_category_id: s.parent_category_id,
    category_name: s.categories?.name ?? '—',
    product_count: countMap[s.id] ?? 0,
  }))

  return (
    <AdminClient
      subcategories={enriched}
      categories={(categories ?? []) as { id: string; name: string }[]}
    />
  )
}
