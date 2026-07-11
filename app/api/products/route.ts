import { NextRequest, NextResponse } from 'next/server'
import { getProducts } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const page = parseInt(sp.get('page') ?? '1', 10)
  const pageSize = parseInt(sp.get('pageSize') ?? '24', 10)

  const brandName = sp.get('brand') ?? undefined
  const categoryText = sp.get('categorie') ?? undefined
  const subcategoryText = sp.get('subcategorie') ?? undefined
  const search = sp.get('q') ?? undefined

  // 2026-07-11: every view — including the "Toate" tab — now goes through
  // plain getProducts(), which orders price descending. The old branch here
  // that mirrored app/produse/page.tsx's isTrulyUnfiltered check and called
  // getHomeProducts() for a merchandising-tiered "Toate" sequence has been
  // retired; see "sorting order rules july 11.md" for what that used to do.
  const result = await getProducts({ page, pageSize, brandName, categoryText, subcategoryText, search })

  return NextResponse.json(result)
}
