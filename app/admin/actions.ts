'use server'
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function reassignSubcategory(subcatId: string, newCategoryId: string) {
  // 1. Update subcategory's parent
  const { error: subErr } = await supabase
    .from('subcategories')
    .update({ parent_category_id: newCategoryId })
    .eq('id', subcatId)
  if (subErr) throw subErr

  // 2. Get new category name
  const { data: cat } = await supabase
    .from('categories')
    .select('name')
    .eq('id', newCategoryId)
    .single()
  if (!cat) throw new Error('Category not found')

  // 3. Update products that belong to this subcategory
  const { error: prodErr } = await supabase
    .from('products')
    .update({
      category_id: newCategoryId,
      category_text: cat.name,
    })
    .eq('subcategory_id', subcatId)
  if (prodErr) throw prodErr

  revalidatePath('/admin')
  revalidatePath('/produse')
}

export async function renameSubcategory(subcatId: string, newName: string) {
  // 1. Get old name so we can update products
  const { data: sub } = await supabase
    .from('subcategories')
    .select('name')
    .eq('id', subcatId)
    .single()
  if (!sub) throw new Error('Subcategory not found')

  // 2. Update subcategory name
  const { error: subErr } = await supabase
    .from('subcategories')
    .update({ name: newName })
    .eq('id', subcatId)
  if (subErr) throw subErr

  // 3. Update products that reference the old subcategory_text
  const { error: prodErr } = await supabase
    .from('products')
    .update({ subcategory_text: newName })
    .eq('subcategory_id', subcatId)
  if (prodErr) throw prodErr

  revalidatePath('/admin')
  revalidatePath('/produse')
}

export async function bulkReassign(subcatIds: string[], newCategoryId: string) {
  // Get new category name once
  const { data: cat } = await supabase
    .from('categories')
    .select('name')
    .eq('id', newCategoryId)
    .single()
  if (!cat) throw new Error('Category not found')

  // Update all subcategories
  const { error: subErr } = await supabase
    .from('subcategories')
    .update({ parent_category_id: newCategoryId })
    .in('id', subcatIds)
  if (subErr) throw subErr

  // Update all products in those subcategories
  const { error: prodErr } = await supabase
    .from('products')
    .update({
      category_id: newCategoryId,
      category_text: cat.name,
    })
    .in('subcategory_id', subcatIds)
  if (prodErr) throw prodErr

  revalidatePath('/admin')
  revalidatePath('/produse')
}
