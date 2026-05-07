import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Uses service key for writes
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  const { productId, categoryText, subcategoryText } = await req.json()
  if (!productId) return NextResponse.json({ error: 'Missing productId' }, { status: 400 })

  // Get category id
  let categoryId = null
  if (categoryText) {
    const { data: cat } = await supabase
      .from('categories').select('id').eq('name', categoryText).single()
    categoryId = cat?.id ?? null
  }

  // Get subcategory id
  let subcategoryId = null
  if (subcategoryText && categoryId) {
    const { data: sub } = await supabase
      .from('subcategories').select('id')
      .eq('name', subcategoryText)
      .eq('parent_category_id', categoryId)
      .single()
    subcategoryId = sub?.id ?? null
  }

  const { error } = await supabase
    .from('products')
    .update({
      category_text: categoryText || null,
      category_id: categoryId,
      subcategory_text: subcategoryText || null,
      subcategory_id: subcategoryId,
    })
    .eq('id', productId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
