'use server'
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { hasValidAdminSession } from '@/lib/auth'

// Service-role client: authenticated admin writes (gated by assertAdmin
// below), same pattern as ../actions.ts — legitimately bypasses RLS.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Server actions are independently POST-able — re-check the session on every
// call, not just via the page guard (see ../actions.ts §3.6 note).
async function assertAdmin() {
  if (!(await hasValidAdminSession())) {
    throw new Error('Unauthorized')
  }
}

// Whitelist of plain text columns editable from the /admin/catalog grid.
// Deliberately explicit (not "any column name the client sends") so a client
// bug/typo can never overwrite an arbitrary products column.
const EDITABLE_TEXT_FIELDS = [
  'brand_name',
  'sku',
  'name',
  'model',
  'short_description',
  'long_description',
  'st1_label', 'st1_value', 'st1_details',
  'st2_label', 'st2_value', 'st2_details',
  'st3_label', 'st3_value', 'st3_details',
  'manufacturer_url',
  'family_name',
] as const

type EditableTextField = typeof EDITABLE_TEXT_FIELDS[number]

export async function updateProductField(
  productId: string,
  field: EditableTextField,
  value: string
) {
  await assertAdmin()
  if (!EDITABLE_TEXT_FIELDS.includes(field)) {
    throw new Error(`Field "${field}" is not editable from this page.`)
  }

  // Empty string → null, consistent with how these columns are populated
  // elsewhere (empty text fields are stored as NULL, not '').
  const nextValue = value.trim() === '' ? null : value

  const { error } = await supabase
    .from('products')
    .update({ [field]: nextValue })
    .eq('id', productId)
  if (error) throw error

  revalidatePath('/admin/catalog')
  // NOTE: intentionally NOT refreshing product_listing_mv here — this page
  // is built for fast, high-volume cell-by-cell edits, and REFRESH
  // MATERIALIZED VIEW CONCURRENTLY over 40k+ rows on every single keystroke-
  // blur would make the grid feel slow. Use the "Actualizează site-ul"
  // button to push accumulated edits to /produse once you're done — same
  // manual-refresh lesson as the Ruko stale-listing fix.
}

export async function updateProductCategory(productId: string, categoryId: string) {
  await assertAdmin()

  const { data: cat, error: catErr } = await supabase
    .from('categories')
    .select('name')
    .eq('id', categoryId)
    .single()
  if (catErr || !cat) throw catErr ?? new Error('Category not found')

  const { error } = await supabase
    .from('products')
    .update({ category_id: categoryId, category_text: cat.name })
    .eq('id', productId)
  if (error) throw error

  revalidatePath('/admin/catalog')
}

export async function updateProductSubcategory(productId: string, subcategoryId: string) {
  await assertAdmin()

  const { data: sub, error: subErr } = await supabase
    .from('subcategories')
    .select('name')
    .eq('id', subcategoryId)
    .single()
  if (subErr || !sub) throw subErr ?? new Error('Subcategory not found')

  const { error } = await supabase
    .from('products')
    .update({ subcategory_id: subcategoryId, subcategory_text: sub.name })
    .eq('id', productId)
  if (error) throw error

  revalidatePath('/admin/catalog')
}

/** Manual "push to site" action — refreshes the product_listing_mv rollup
 *  that /produse actually reads from, then revalidates the listing pages.
 *  Deliberately a separate, explicit action rather than automatic per-edit
 *  (see note in updateProductField above). */
export async function refreshCatalogListing() {
  await assertAdmin()
  const { error } = await supabase.rpc('refresh_product_listing')
  if (error) throw error
  revalidatePath('/produse')
  revalidatePath('/admin/catalog')
}
