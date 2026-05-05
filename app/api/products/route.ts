import { NextRequest, NextResponse } from 'next/server'
import { getProducts } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const page = parseInt(sp.get('page') ?? '1', 10)
  const pageSize = parseInt(sp.get('pageSize') ?? '100', 10)

  const result = await getProducts({
    page,
    pageSize,
    brandName: sp.get('brand') ?? undefined,
    categoryText: sp.get('categorie') ?? undefined,
    search: sp.get('q') ?? undefined,
  })

  return NextResponse.json(result)
}
