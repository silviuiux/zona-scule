import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { hasValidAdminSession } from '@/lib/auth'
import StatusClient from './StatusClient'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const dynamic = 'force-dynamic'

export type EnrichmentRow = {
  brand_name: string
  category_text: string
  total: number
  has_desc: number
  has_st1: number
  has_st2: number
  has_st3: number
  has_app1: number
  has_app2: number
  has_app3: number
  enriched_count: number
}

export default async function AdminStatusPage() {
  // Same authoritative gate as /admin — proxy.ts covers /admin/:path* already,
  // but the page re-checks per the "not the only gate" pattern used site-wide.
  if (!(await hasValidAdminSession())) redirect('/admin/login?next=/admin/status')

  const { data, error } = await supabase.rpc('products_enrichment_overview')
  if (error) throw error

  return <StatusClient rows={(data ?? []) as EnrichmentRow[]} />
}
