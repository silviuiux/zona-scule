import { NextRequest, NextResponse } from 'next/server'
import { getSubcategoriesByCategoryName } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const categorie = req.nextUrl.searchParams.get('categorie')
  if (!categorie) return NextResponse.json([])
  const subs = await getSubcategoriesByCategoryName(categorie)
  return NextResponse.json(subs)
}
