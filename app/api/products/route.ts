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

  let result
  if (isTrulyUnfiltered) {
    try {
      result = await getHomeProducts({ page, pageSize })
    } catch (err) {
      // Falling back here can duplicate/skip a few items right at the seam
      // (the plain listing isn't offset-aligned with the tiered one), but
      // that's a minor "Load more" glitch — far better than a 500 on every
      // subsequent page once someone's already looking at page 1.
      console.error('[api/products] getHomeProducts failed, falling back to plain listing:', err)
      result = await getProducts({ page, pageSize })
    }
  } else {
    result = await getProducts({ page, pageSize, brandName, categoryText, subcategoryText, search })
  }

  return NextResponse.json(result)
}
