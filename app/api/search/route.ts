import { NextRequest, NextResponse } from 'next/server'
import { getProducts } from '@/lib/supabase'

/**
 * GET /api/search?q=...
 * Lightweight typeahead endpoint — returns up to 8 products with only the
 * fields needed for the suggestion card (image, brand, model, slug, category).
 */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? ''
  if (q.length < 2) return NextResponse.json({ products: [] })

  const { products } = await getProducts({ page: 1, pageSize: 8, search: q })

  const slim = products.map(p => ({
    slug: p.slug,
    brand: p.brand_name,
    model: p.model ?? p.sku ?? p.name,
    category: p.category_text,
    img: p.main_image_storage_url || p.main_image_url || null,
  }))

  return NextResponse.json({ products: slim }, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
