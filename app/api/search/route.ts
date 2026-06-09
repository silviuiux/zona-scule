import { NextRequest, NextResponse } from 'next/server'
import { getProducts } from '@/lib/supabase'

/**
 * GET /api/search?q=...
 * Lightweight typeahead — up to 8 slim suggestion records.
 */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim().slice(0, 80) ?? ''
  if (q.length < 2) return NextResponse.json({ products: [] })

  const { products } = await getProducts({
    page: 1, pageSize: 8, search: q,
    columns: 'slug,brand_name,model,sku,name,category_text,main_image_storage_url,main_image_url',
  })

  const slim = products.map(p => ({
    slug: p.slug,
    brand: p.brand_name,
    model: p.model ?? p.sku ?? p.name,
    category: p.category_text,
    img: p.main_image_storage_url || p.main_image_url || null,
  }))

  return NextResponse.json({ products: slim }, {
    headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300' },
  })
}
