'use client'
import { useState, useEffect, useRef } from 'react'
import ProductCard from '@/components/ProductCard'
import type { Product } from '@/lib/supabase'

type Filters = {
  brand?: string
  categorie?: string
  subcategorie?: string
  q?: string
}

type SavedState = {
  products: Product[]
  page: number
  lastSlug?: string
}

function makeStoreKey(filters: Filters) {
  return `zs_lm:${filters.brand ?? ''}|${filters.categorie ?? ''}|${filters.subcategorie ?? ''}|${filters.q ?? ''}`
}

export default function LoadMore({
  initialCount,
  total,
  filters,
}: {
  initialCount: number
  total: number
  filters: Filters
}) {
  const storeKey = makeStoreKey(filters)

  const [products, setProducts] = useState<Product[]>([])
  const [page, setPage] = useState(2)
  const [loading, setLoading] = useState(false)

  // Ref to hold the slug we should scroll to after products render
  const scrollTarget = useRef<string | null>(null)
  // Guard so we only attempt sessionStorage restore once on mount
  const didRestore = useRef(false)

  // ── 1. Restore from sessionStorage on mount ────────────────────────────────
  useEffect(() => {
    if (didRestore.current) return
    didRestore.current = true
    try {
      const raw = sessionStorage.getItem(storeKey)
      if (!raw) return
      const saved: SavedState = JSON.parse(raw)
      if (saved.products?.length) {
        setProducts(saved.products)
        setPage(saved.page ?? 2)
        scrollTarget.current = saved.lastSlug ?? null
      }
    } catch {
      // sessionStorage unavailable or corrupt — start fresh
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentionally empty: runs once on mount

  // ── 2. Scroll to last-viewed product after products render ─────────────────
  useEffect(() => {
    const slug = scrollTarget.current
    if (!slug || products.length === 0) return
    scrollTarget.current = null

    // Defer until after paint so the grid is fully laid out
    const id = setTimeout(() => {
      try {
        const el = document.querySelector(
          `a[href="/produse/${CSS.escape(slug)}"]`
        ) as HTMLElement | null
        if (el) el.scrollIntoView({ block: 'center', behavior: 'instant' })
      } catch {}
    }, 80)
    return () => clearTimeout(id)
  }, [products.length]) // fires when products go from 0 → N

  // ── 3. Persist products to sessionStorage whenever they change ─────────────
  useEffect(() => {
    if (!products.length) return
    try {
      const existing: Partial<SavedState> = (() => {
        try { return JSON.parse(sessionStorage.getItem(storeKey) ?? '{}') } catch { return {} }
      })()
      sessionStorage.setItem(
        storeKey,
        JSON.stringify({ ...existing, products, page } satisfies SavedState)
      )
    } catch {}
  }, [products, page, storeKey])

  // ── 4. Track which product was clicked so we can scroll back to it ─────────
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element)?.closest?.('a') as HTMLAnchorElement | null
      if (!link) return
      const match = link.pathname?.match(/^\/produse\/([^/?#]+)$/)
      if (!match) return
      const slug = match[1]
      try {
        const existing: Partial<SavedState> = (() => {
          try { return JSON.parse(sessionStorage.getItem(storeKey) ?? '{}') } catch { return {} }
        })()
        sessionStorage.setItem(storeKey, JSON.stringify({ ...existing, lastSlug: slug }))
      } catch {}
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [storeKey])

  // ── Load more ──────────────────────────────────────────────────────────────
  const loadedCount = initialCount + products.length
  const hasMore = loadedCount < total

  const handleLoadMore = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: '100' })
      if (filters.brand)       params.set('brand',       filters.brand)
      if (filters.categorie)   params.set('categorie',   filters.categorie)
      if (filters.subcategorie) params.set('subcategorie', filters.subcategorie)
      if (filters.q)           params.set('q',           filters.q)

      const res = await fetch(`/api/products?${params}`)
      const data = await res.json()
      setProducts(prev => [...prev, ...data.products])
      setPage(p => p + 1)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {products.length > 0 && (
        <div className="products-grid">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}

      {hasMore && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleLoadMore}
            disabled={loading}
            style={{
              padding: '12px 40px',
              background: loading ? 'rgba(0,0,0,0.1)' : 'rgb(0,0,0)',
              color: loading ? 'rgba(0,0,0,0.4)' : 'rgb(255,255,255)',
              border: 'none', borderRadius: '2px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '12px', fontWeight: 600,
              letterSpacing: '0.07em', textTransform: 'uppercase',
              cursor: loading ? 'default' : 'pointer',
              transition: 'background 150ms',
            }}
          >
            {loading ? 'SE INCARCA...' : 'INCARCA MAI MULTE'}
          </button>
          <span style={{
            fontFamily: 'Recursive, sans-serif',
            fontSize: '12px',
            color: 'rgba(0,0,0,0.35)',
          }}>
            {loadedCount} din {total.toLocaleString('ro')} produse
          </span>
        </div>
      )}
    </>
  )
}
