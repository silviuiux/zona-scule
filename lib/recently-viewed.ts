/**
 * Recently viewed products, kept in this browser only (localStorage):
 * each product page records itself, the contact form's "Istoric" modal
 * reads the list. Newest first, at most 25, one entry per product.
 */
export type RecentProduct = { slug: string; name: string; brand: string | null; sku: string | null; image: string | null; t: number }

const KEY = 'zs-recent'
export const RECENT_MAX = 25

export function readRecent(): RecentProduct[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(v) ? (v as RecentProduct[]).filter(p => p && typeof p.slug === 'string') : []
  } catch { return [] }
}

export function recordRecent(p: Omit<RecentProduct, 't'>) {
  try {
    const list = [{ ...p, t: Date.now() }, ...readRecent().filter(x => x.slug !== p.slug)].slice(0, RECENT_MAX)
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {}
}
