'use server'
import { revalidatePath } from 'next/cache'
import { isAdmin } from '@/lib/adminAuth'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

/** Throws unless the caller carries the admin cookie (set by /admin Basic Auth). */
async function requireAdmin() {
  if (!(await isAdmin())) throw new Error('Neautorizat')
  return getSupabaseAdmin()
}

export async function reassignSubcategory(subcatId: string, newCategoryId: string) {
  const supabase = await requireAdmin()

  const { error: subErr } = await supabase
    .from('subcategories')
    .update({ parent_category_id: newCategoryId })
    .eq('id', subcatId)
  if (subErr) throw subErr

  const { data: cat } = await supabase
    .from('categories')
    .select('name')
    .eq('id', newCategoryId)
    .single()
  if (!cat) throw new Error('Category not found')

  const { error: prodErr } = await supabase
    .from('products')
    .update({ category_id: newCategoryId, category_text: cat.name })
    .eq('subcategory_id', subcatId)
  if (prodErr) throw prodErr

  revalidatePath('/admin')
  revalidatePath('/produse')
}

export async function renameSubcategory(subcatId: string, newName: string) {
  const supabase = await requireAdmin()

  const { data: sub } = await supabase
    .from('subcategories')
    .select('name')
    .eq('id', subcatId)
    .single()
  if (!sub) throw new Error('Subcategory not found')

  const { error: subErr } = await supabase
    .from('subcategories')
    .update({ name: newName })
    .eq('id', subcatId)
  if (subErr) throw subErr

  const { error: prodErr } = await supabase
    .from('products')
    .update({ subcategory_text: newName })
    .eq('subcategory_id', subcatId)
  if (prodErr) throw prodErr

  revalidatePath('/admin')
  revalidatePath('/produse')
}

export async function bulkReassign(subcatIds: string[], newCategoryId: string) {
  const supabase = await requireAdmin()

  const { data: cat } = await supabase
    .from('categories')
    .select('name')
    .eq('id', newCategoryId)
    .single()
  if (!cat) throw new Error('Category not found')

  const { error: subErr } = await supabase
    .from('subcategories')
    .update({ parent_category_id: newCategoryId })
    .in('id', subcatIds)
  if (subErr) throw subErr

  const { error: prodErr } = await supabase
    .from('products')
    .update({ category_id: newCategoryId, category_text: cat.name })
    .in('subcategory_id', subcatIds)
  if (prodErr) throw prodErr

  revalidatePath('/admin')
  revalidatePath('/produse')
}
