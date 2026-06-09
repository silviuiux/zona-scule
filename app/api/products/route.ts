import { NextRequest, NextResponse } from 'next/server'
import { getProducts, CARD_COLUMNS } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  // Clamp paging inputs — this is a public endpoint.
  const page = Math.min(Math.max(parseInt(sp.get('page') ?? '1', 10) || 1, 1), 500)
  const pageSize = Math.min(Math.max(parseInt(sp.get('pageSize') ?? '100', 10) || 100, 1), 100)

  const result = await getProducts({
    page,
    pageSize,
    brandName: sp.get('brand') ?? undefined,
    categoryText: sp.get('categorie') ?? undefined,
    subcategoryText: sp.get('subcategorie') ?? undefined,
    search: sp.get('q')?.slice(0, 80) ?? undefined,
    columns: CARD_COLUMNS,
  })

  return NextResponse.json(result, {
    headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
  })
}
