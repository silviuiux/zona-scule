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
    // Deferred so the restore doesn't trigger a cascading sync render.
    const raf = requestAnimationFrame(() => {
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
    })
    return () => cancelAnimationFrame(raf)
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
      <style>{`
        @keyframes lm-shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position:  600px 0; }
        }
        .lm-skel {
          background: linear-gradient(
            90deg,
            rgb(232,232,232) 25%,
            rgb(244,244,244) 50%,
            rgb(232,232,232) 75%
          );
          background-size: 600px 100%;
          animation: lm-shimmer 1.5s ease-in-out infinite;
          border-radius: 3px;
        }
        .lm-skel-card {
          background: rgb(255,255,255);
          border-radius: 4px;
          overflow: hidden;
        }
        .lm-skel-img { aspect-ratio: 1; width: 100%; }
        .lm-skel-body {
          padding: 16px;
          display: flex; flex-direction: column; gap: 8px;
        }
      `}</style>

      {/* Previously loaded (persisted) products */}
      {products.length > 0 && (
        <div className="products-grid">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}

      {/* Skeleton grid shown while the next batch is fetching */}
      {loading && (
        <div className="products-grid">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="lm-skel-card">
              <div className="lm-skel lm-skel-img" />
              <div className="lm-skel-body">
                <div className="lm-skel" style={{ height: 13, width: '38%' }} />
                <div className="lm-skel" style={{ height: 13, width: '72%' }} />
                <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
                  <div className="lm-skel" style={{ height: 12, width: '28%' }} />
                  <div className="lm-skel" style={{ height: 12, width: '22%' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {hasMore && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleLoadMore}
            style={{
              padding: '12px 40px',
              background: 'rgb(0,0,0)',
              color: 'rgb(255,255,255)',
              border: 'none', borderRadius: '2px',
              fontFamily: 'var(--font-inter), sans-serif',
              fontSize: '12px', fontWeight: 600,
              letterSpacing: '0.07em', textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'background 150ms',
            }}
          >
            INCARCA MAI MULTE
          </button>
          <span style={{
            fontFamily: 'var(--font-recursive), sans-serif',
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
