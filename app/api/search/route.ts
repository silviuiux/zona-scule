import { NextRequest, NextResponse } from 'next/server'
import { getProducts } from '@/lib/supabase'

/**
 * GET /api/search?q=...
 * Lightweight typeahead endpoint:
 *  - `products`: up to 8 products for a suggestion card (image, brand, model,
 *    slug, category);
 *  - `terms`: a few query completions for the navbar ("rotopercutor bosch",
 *    "rotopercutor 18V", "rotopercutoare"), built from the matching products:
 *    the word the last typed token completes to, then that word with the
 *    brands and battery voltages most common among the matches.
 */
const fold = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

function completions(q: string, rows: { name: string; brand_name: string | null; subcategory_text: string | null; category_text: string | null; short_description: string | null }[]) {
  const tokens = q.trim().split(/\s+/)
  const last = fold(tokens[tokens.length - 1])
  const head = tokens.slice(0, -1).join(' ')
  const lead = (w: string) => (head ? `${head} ${w}` : w)

  // words that complete the last token, most frequent first
  const words = new Map<string, number>()
  for (const r of rows) {
    const text = [r.name, r.subcategory_text, r.category_text, r.short_description].filter(Boolean).join(' ')
    for (const raw of text.split(/[^\p{L}\p{N}-]+/u)) {
      const w = raw.toLowerCase()
      if (w.length < last.length || !fold(w).startsWith(last) || /^\d/.test(w) && !/^\d/.test(last)) continue
      words.set(w, (words.get(w) ?? 0) + 1)
    }
  }
  // merge spellings with and without diacritics, keeping the accented one
  const byFold = new Map<string, { w: string; n: number }>()
  for (const [w, n] of words) {
    const k = fold(w), cur = byFold.get(k)
    if (!cur) byFold.set(k, { w, n })
    else byFold.set(k, { w: w !== k ? w : cur.w, n: cur.n + n })
  }
  const ranked = [...byFold.values()].sort((a, b) => b.n - a.n).map(x => x.w)
  const word = ranked[0] ?? tokens[tokens.length - 1].toLowerCase()

  const count = (vals: (string | null)[]) => {
    const m = new Map<string, number>()
    for (const v of vals) if (v) m.set(v, (m.get(v) ?? 0) + 1)
    return [...m.entries()].sort((a, b) => b[1] - a[1]).map(([v]) => v)
  }
  const brands = count(rows.map(r => r.brand_name)).slice(0, 2)
  const volts = count(rows.map(r => r.name.match(/\b(12|18|36)\s?V\b/i)?.[1] ?? null)).slice(0, 1)

  const out = [
    ...brands.map(b => lead(`${word} ${b.toLowerCase()}`)),
    ...volts.map(v => lead(`${word} ${v}V`)),
    ...ranked.slice(1, 3).map(lead),
  ]
  const seen = new Set<string>()
  return out.filter(t => fold(t) !== fold(q.trim()) && !seen.has(fold(t)) && seen.add(fold(t))).slice(0, 5)
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? ''
  if (q.length < 2) return NextResponse.json({ products: [], terms: [] })

  const { products } = await getProducts({ page: 1, pageSize: 40, search: q })

  const slim = products.slice(0, 8).map(p => ({
    slug: p.slug,
    brand: p.brand_name,
    model: p.model ?? p.sku ?? p.name,
    category: p.category_text,
    img: p.main_image_storage_url || p.main_image_url || null,
  }))

  return NextResponse.json({ products: slim, terms: completions(q, products) }, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
