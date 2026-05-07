import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('categories')
    .select('name')
    .order('sort_order', { ascending: true, nullsFirst: false })
  if (error) return NextResponse.json([])
  return NextResponse.json(data)
}
