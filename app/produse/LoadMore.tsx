'use client'
import { useState } from 'react'
import ProductCard from '@/components/ProductCard'
import type { Product } from '@/lib/supabase'

type Filters = { brand?: string; categorie?: string; q?: string }

export default function LoadMore({
  initialCount,
  total,
  filters,
}: {
  initialCount: number
  total: number
  filters: Filters
}) {
  const [products, setProducts] = useState<Product[]>([])
  const [page, setPage] = useState(2)
  const [loading, setLoading] = useState(false)

  const loadedCount = initialCount + products.length
  const hasMore = loadedCount < total

  const handleLoadMore = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: '100' })
      if (filters.brand) params.set('brand', filters.brand)
      if (filters.categorie) params.set('categorie', filters.categorie)
      if (filters.q) params.set('q', filters.q)

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
      {/* Additional products loaded via Load More */}
      {products.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '40px',
        }}>
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
            {loading ? 'SE INCARCA...' : `INCARCA MAI MULTE`}
          </button>
          <span style={{ fontFamily: 'Recursive, sans-serif', fontSize: '12px', color: 'rgba(0,0,0,0.35)' }}>
            {loadedCount} din {total.toLocaleString('ro')} produse
          </span>
        </div>
      )}
    </>
  )
}
