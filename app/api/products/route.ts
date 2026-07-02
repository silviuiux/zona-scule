import { NextRequest, NextResponse } from 'next/server'
import { getProducts, getHomeProducts } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const page = parseInt(sp.get('page') ?? '1', 10)
  const pageSize = parseInt(sp.get('pageSize') ?? '24', 10)

  const brandName = sp.get('brand') ?? undefined
  const categoryText = sp.get('categorie') ?? undefined
  const subcategoryText = sp.get('subcategorie') ?? undefined
  const search = sp.get('q') ?? undefined

  // Mirrors app/produse/page.tsx's isTrulyUnfiltered check — "Load more" on
  // the "Toate" tab must keep fetching from the same tiered sequence
  // (aspiratoare → scule electrice → restul Curatenie → rest) as the initial
  // server-rendered page, or the offset math between the two would drift and
  // pages would skip/repeat products.
  const isTrulyUnfiltered = !brandName && !categoryText && !subcategoryText && !search

  const result = isTrulyUnfiltered
    ? await getHomeProducts({ page, pageSize })
    : await getProducts({ page, pageSize, brandName, categoryText, subcategoryText, search })

  return NextResponse.json(result)
}
