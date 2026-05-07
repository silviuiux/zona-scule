import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const brand = req.nextUrl.searchParams.get('brand')
  if (!brand) return NextResponse.json([])

  const { data, error } = await supabase
    .from('products')
    .select('category_text')
    .ilike('brand_name', brand)
    .not('category_text', 'is', null)

  if (error) return NextResponse.json([])

  const countMap: Record<string, number> = {}
  for (const row of data ?? []) {
    if (row.category_text) {
      countMap[row.category_text] = (countMap[row.category_text] ?? 0) + 1
    }
  }

  return NextResponse.json(
    Object.entries(countMap)
      .map(([name, product_count]) => ({ name, product_count }))
      .sort((a, b) => b.product_count - a.product_count)
  )
}
