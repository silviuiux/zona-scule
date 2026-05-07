'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import type { CategoryWithCount, BrandWithCount } from '@/lib/supabase'

type Sub = { id: string; name: string; product_count: number }
type BrandCat = { name: string; product_count: number }

export default function Sidebar({
  categories,
  brands,
  activeCat,
  activeSub,
  activeBrand,
}: {
  categories: CategoryWithCount[]
  brands: BrandWithCount[]
  activeCat?: string
  activeSub?: string
  activeBrand?: string
}) {
  const [expandedCat, setExpandedCat] = useState<string | undefined>(activeCat)
  const [expandedBrand, setExpandedBrand] = useState<string | undefined>(activeBrand)
  const [subs, setSubs] = useState<Sub[]>([])
  const [brandCats, setBrandCats] = useState<BrandCat[]>([])
  const [loadingSubs, setLoadingSubs] = useState(false)
  const [loadingBrandCats, setLoadingBrandCats] = useState(false)

  // Fetch subcategories when category expands
  useEffect(() => {
    if (!expandedCat) { setSubs([]); return }
    setLoadingSubs(true)
    fetch(`/api/subcategories?categorie=${encodeURIComponent(expandedCat)}`)
      .then(r => r.json())
      .then(data => { setSubs(data); setLoadingSubs(false) })
      .catch(() => setLoadingSubs(false))
  }, [expandedCat])

  // Fetch brand categories when brand expands
  useEffect(() => {
    if (!expandedBrand) { setBrandCats([]); return }
    setLoadingBrandCats(true)
    fetch(`/api/brand-categories?brand=${encodeURIComponent(expandedBrand)}`)
      .then(r => r.json())
      .then(data => { setBrandCats(data); setLoadingBrandCats(false) })
      .catch(() => setLoadingBrandCats(false))
  }, [expandedBrand])

  const handleCatClick = (catName: string) => {
    setExpandedCat(prev => prev === catName ? undefined : catName)
    setExpandedBrand(undefined) // close brand accordion
  }

  const handleBrandClick = (brandName: string) => {
    setExpandedBrand(prev => prev === brandName ? undefined : brandName)
    setExpandedCat(undefined) // close category accordion
  }

  return (
    <>
      <style>{`
        .sidebar {
          width: 220px; flex-shrink: 0;
          padding: 32px 0 40px 12px;
          border-right: 1px solid rgba(0,0,0,0.08);
          position: sticky; top: 52px;
          height: calc(100vh - 52px);
          overflow-y: auto;
        }
        .sidebar::-webkit-scrollbar { width: 3px; }
        .sidebar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); }

        .sidebar-section-title {
          font-family: 'Inter', sans-serif;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: rgba(0,0,0,0.3); margin-bottom: 6px;
          padding-left: 8px;
        }
        .sidebar-block { margin-bottom: 28px; }

        /* Row shared by cats and brands */
        .sidebar-row {
          display: flex; align-items: center;
          width: 100%; background: none; border: none;
          cursor: pointer; padding: 0; text-align: left;
          border-radius: 3px; transition: background 100ms;
        }
        .sidebar-row:hover { background: rgba(0,0,0,0.03); }
        .sidebar-row.active { background: rgba(217,44,43,0.06); }

        .sidebar-row-link {
          flex: 1; display: flex; align-items: center; justify-content: space-between;
          padding: 6px 8px;
          font-family: 'Recursive', sans-serif;
          font-size: 13px; color: rgba(0,0,0,0.6);
          text-decoration: none; gap: 6px; min-width: 0;
          transition: color 150ms;
        }
        .sidebar-row.active .sidebar-row-link { color: rgb(217,44,43); font-weight: 500; }
        .sidebar-row-link:hover { color: rgb(0,0,0); }

        .row-name {
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;
        }
        .count-pill {
          flex-shrink: 0;
          font-family: 'Inter', sans-serif;
          font-size: 10px; font-weight: 500;
          padding: 1px 6px; border-radius: 999px;
          background: rgba(0,0,0,0.07); color: rgba(0,0,0,0.4);
          min-width: 22px; text-align: center;
        }
        .sidebar-row.active .count-pill {
          background: rgba(217,44,43,0.12); color: rgb(217,44,43);
        }
        .chevron {
          flex-shrink: 0; margin-right: 6px;
          color: rgba(0,0,0,0.3); transition: transform 200ms;
          display: flex; align-items: center; background: none; border: none; cursor: pointer;
          padding: 2px;
        }
        .sidebar-row.active .chevron { color: rgb(217,44,43); }

        /* Expandable list — shared for subcats and brand cats */
        .expand-list {
          overflow: hidden;
          transition: max-height 250ms ease, opacity 200ms ease;
          max-height: 0; opacity: 0;
        }
        .expand-list.open { max-height: 1000px; opacity: 1; }

        .expand-link {
          display: flex; align-items: center; justify-content: space-between;
          padding: 5px 8px 5px 20px;
          font-family: 'Recursive', sans-serif;
          font-size: 12px; color: rgba(0,0,0,0.5);
          text-decoration: none; border-radius: 3px; gap: 6px;
          transition: color 150ms, background 150ms;
        }
        .expand-link:hover { color: rgb(0,0,0); background: rgba(0,0,0,0.03); }
        .expand-link.active {
          color: rgb(217,44,43); font-weight: 500;
          background: rgba(217,44,43,0.04);
        }
        .expand-link.active .count-pill {
          background: rgba(217,44,43,0.12); color: rgb(217,44,43);
        }
        .expand-name {
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;
        }
        .expand-loading {
          padding: 6px 8px 6px 20px;
          font-family: 'Recursive', sans-serif;
          font-size: 11px; color: rgba(0,0,0,0.3); font-style: italic;
        }

        .sidebar-link {
          display: block; padding: 5px 8px;
          font-family: 'Recursive', sans-serif;
          font-size: 13px; color: rgba(0,0,0,0.55);
          text-decoration: none; border-radius: 3px;
          transition: color 150ms, background 150ms;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .sidebar-link:hover { color: rgb(0,0,0); background: rgba(0,0,0,0.03); }
        .sidebar-link.active { color: rgb(217,44,43); background: rgba(217,44,43,0.06); font-weight: 500; }
      `}</style>

      <aside className="sidebar">

        {/* ── CATEGORII ── */}
        <div className="sidebar-block">
          <p className="sidebar-section-title">Categorii</p>

          <div className="sidebar-row">
            <Link href="/produse" className="sidebar-row-link"
              style={{ color: !activeCat && !activeBrand ? 'rgb(217,44,43)' : undefined }}>
              <span className="row-name">Toate</span>
            </Link>
          </div>

          {categories.map(cat => {
            const isActive = activeCat === cat.name
            const isExpanded = expandedCat === cat.name
            return (
              <div key={cat.id}>
                <div className={`sidebar-row${isActive ? ' active' : ''}`}>
                  <Link
                    href={`/produse?categorie=${encodeURIComponent(cat.name)}`}
                    className="sidebar-row-link"
                    onClick={() => handleCatClick(cat.name)}
                  >
                    <span className="row-name">{cat.name}</span>
                    {cat.product_count > 0 && (
                      <span className="count-pill">{cat.product_count.toLocaleString('ro')}</span>
                    )}
                  </Link>
                  <button className="chevron" onClick={e => { e.preventDefault(); handleCatClick(cat.name) }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                      style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 200ms' }}>
                      <path d="m9 18 6-6-6-6"/>
                    </svg>
                  </button>
                </div>

                <div className={`expand-list${isExpanded ? ' open' : ''}`}>
                  {loadingSubs && isExpanded && <span className="expand-loading">Se încarcă...</span>}
                  {!loadingSubs && isExpanded && subs.length === 0 && <span className="expand-loading">—</span>}
                  {!loadingSubs && isExpanded && subs.map(sub => (
                    <Link key={sub.id}
                      href={`/produse?categorie=${encodeURIComponent(cat.name)}&subcategorie=${encodeURIComponent(sub.name)}`}
                      className={`expand-link${activeSub === sub.name ? ' active' : ''}`}>
                      <span className="expand-name">{sub.name}</span>
                      {sub.product_count > 0 && (
                        <span className="count-pill">{sub.product_count.toLocaleString('ro')}</span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* ── BRANDURI ── */}
        <div className="sidebar-block">
          <p className="sidebar-section-title">Branduri</p>

          {brands.map(brand => {
            const isActive = activeBrand === brand.name
            const isExpanded = expandedBrand === brand.name
            return (
              <div key={brand.id}>
                <div className={`sidebar-row${isActive ? ' active' : ''}`}>
                  <Link
                    href={`/produse?brand=${encodeURIComponent(brand.name)}`}
                    className="sidebar-row-link"
                    onClick={() => handleBrandClick(brand.name)}
                  >
                    <span className="row-name">{brand.name}</span>
                    {brand.product_count > 0 && (
                      <span className="count-pill">{brand.product_count.toLocaleString('ro')}</span>
                    )}
                  </Link>
                  <button className="chevron" onClick={e => { e.preventDefault(); handleBrandClick(brand.name) }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                      style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 200ms' }}>
                      <path d="m9 18 6-6-6-6"/>
                    </svg>
                  </button>
                </div>

                {/* Brand categories accordion */}
                <div className={`expand-list${isExpanded ? ' open' : ''}`}>
                  {loadingBrandCats && isExpanded && <span className="expand-loading">Se încarcă...</span>}
                  {!loadingBrandCats && isExpanded && brandCats.map(cat => (
                    <Link key={cat.name}
                      href={`/produse?brand=${encodeURIComponent(brand.name)}&categorie=${encodeURIComponent(cat.name)}`}
                      className={`expand-link${activeCat === cat.name ? ' active' : ''}`}>
                      <span className="expand-name">{cat.name}</span>
                      {cat.product_count > 0 && (
                        <span className="count-pill">{cat.product_count.toLocaleString('ro')}</span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

      </aside>
    </>
  )
}
