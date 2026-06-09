import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/adminAuth'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

/**
 * POST /api/update-product-category
 * Admin-only: re-categorizes a product. Auth = zs_admin cookie set after
 * Basic Auth on /admin (see proxy.ts). Returns 401 for the public.
 */
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  let body: { productId?: string; categoryText?: string; subcategoryText?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON invalid' }, { status: 400 })
  }

  const { productId, categoryText, subcategoryText } = body
  if (!productId || typeof productId !== 'string') {
    return NextResponse.json({ error: 'Missing productId' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()

  let categoryId: string | null = null
  if (categoryText) {
    const { data: cat } = await supabase
      .from('categories').select('id').eq('name', categoryText).single()
    categoryId = cat?.id ?? null
  }

  let subcategoryId: string | null = null
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
