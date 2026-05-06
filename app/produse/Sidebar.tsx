'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import type { CategoryWithCount } from '@/lib/supabase'

type Sub = { id: string; name: string; product_count: number }

export default function Sidebar({
  categories,
  brands,
  activeCat,
  activeSub,
  activeBrand,
}: {
  categories: CategoryWithCount[]
  brands: { id: string; name: string }[]
  activeCat?: string
  activeSub?: string
  activeBrand?: string
}) {
  const [expandedCat, setExpandedCat] = useState<string | undefined>(activeCat)
  const [subs, setSubs] = useState<Sub[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch subcategories when expanded cat changes
  useEffect(() => {
    if (!expandedCat) { setSubs([]); return }
    setLoading(true)
    fetch(`/api/subcategories?categorie=${encodeURIComponent(expandedCat)}`)
      .then(r => r.json())
      .then(data => { setSubs(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [expandedCat])

  const handleCatClick = (catName: string) => {
    // Toggle: click same cat closes it
    setExpandedCat(prev => prev === catName ? undefined : catName)
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

        /* Category row — button not link (handles expand) */
        .cat-row {
          display: flex; align-items: center;
          width: 100%; background: none; border: none;
          cursor: pointer; padding: 0; text-align: left;
          border-radius: 3px; transition: background 100ms;
        }
        .cat-row:hover { background: rgba(0,0,0,0.03); }
        .cat-row.active { background: rgba(217,44,43,0.06); }

        .cat-row-link {
          flex: 1; display: flex; align-items: center; justify-content: space-between;
          padding: 6px 8px;
          font-family: 'Recursive', sans-serif;
          font-size: 13px; color: rgba(0,0,0,0.6);
          text-decoration: none; gap: 6px; min-width: 0;
          transition: color 150ms;
        }
        .cat-row.active .cat-row-link { color: rgb(217,44,43); font-weight: 500; }
        .cat-row-link:hover { color: rgb(0,0,0); }

        .cat-name {
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
        .cat-row.active .count-pill {
          background: rgba(217,44,43,0.12); color: rgb(217,44,43);
        }
        .chevron {
          flex-shrink: 0; margin-right: 6px;
          color: rgba(0,0,0,0.3); transition: transform 200ms;
          display: flex; align-items: center;
        }
        .chevron.open { transform: rotate(90deg); }
        .cat-row.active .chevron { color: rgb(217,44,43); }

        /* Subcategory list */
        .sub-list {
          overflow: hidden;
          transition: max-height 250ms ease, opacity 200ms ease;
          max-height: 0; opacity: 0;
        }
        .sub-list.open { max-height: 800px; opacity: 1; }

        .sub-link {
          display: flex; align-items: center; justify-content: space-between;
          padding: 5px 8px 5px 20px;
          font-family: 'Recursive', sans-serif;
          font-size: 12px; color: rgba(0,0,0,0.5);
          text-decoration: none; border-radius: 3px; gap: 6px;
          transition: color 150ms, background 150ms;
        }
        .sub-link:hover { color: rgb(0,0,0); background: rgba(0,0,0,0.03); }
        .sub-link.active {
          color: rgb(217,44,43); font-weight: 500;
          background: rgba(217,44,43,0.04);
        }
        .sub-link.active .count-pill {
          background: rgba(217,44,43,0.12); color: rgb(217,44,43);
        }
        .sub-name {
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;
        }
        .sub-loading {
          padding: 6px 8px 6px 20px;
          font-family: 'Recursive', sans-serif;
          font-size: 11px; color: rgba(0,0,0,0.3);
          font-style: italic;
        }

        /* Brand links */
        .sidebar-link {
          display: block;
          padding: 5px 8px;
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

        {/* ── Categories ── */}
        <div className="sidebar-block">
          <p className="sidebar-section-title">Categorii</p>

          {/* All */}
          <div className="cat-row">
            <Link href="/produse" className="cat-row-link" style={{ color: !activeCat && !activeBrand ? 'rgb(217,44,43)' : undefined }}>
              <span className="cat-name">Toate</span>
            </Link>
          </div>

          {categories.map(cat => {
            const isActive = activeCat === cat.name
            const isExpanded = expandedCat === cat.name

            return (
              <div key={cat.id}>
                <div className={`cat-row${isActive ? ' active' : ''}`}>
                  {/* Clicking the row navigates AND toggles */}
                  <Link
                    href={`/produse?categorie=${encodeURIComponent(cat.name)}`}
                    className="cat-row-link"
                    onClick={() => handleCatClick(cat.name)}
                  >
                    <span className="cat-name">{cat.name}</span>
                    {cat.product_count > 0 && (
                      <span className="count-pill">{cat.product_count.toLocaleString('ro')}</span>
                    )}
                  </Link>
                  {/* Chevron toggles expand without navigating */}
                  <button
                    className="chevron"
                    onClick={e => { e.preventDefault(); handleCatClick(cat.name) }}
                    aria-label="Expandează subcategorii"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                      style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 200ms' }}>
                      <path d="m9 18 6-6-6-6"/>
                    </svg>
                  </button>
                </div>

                {/* Subcategory list */}
                <div className={`sub-list${isExpanded ? ' open' : ''}`}>
                  {loading && isExpanded && (
                    <span className="sub-loading">Se încarcă...</span>
                  )}
                  {!loading && isExpanded && subs.length === 0 && (
                    <span className="sub-loading">Fără subcategorii</span>
                  )}
                  {!loading && isExpanded && subs.map(sub => (
                    <Link
                      key={sub.id}
                      href={`/produse?categorie=${encodeURIComponent(cat.name)}&subcategorie=${encodeURIComponent(sub.name)}`}
                      className={`sub-link${activeSub === sub.name ? ' active' : ''}`}
                    >
                      <span className="sub-name">{sub.name}</span>
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

        {/* ── Brands ── */}
        <div className="sidebar-block">
          <p className="sidebar-section-title">Branduri</p>
          {brands.map(b => (
            <Link key={b.id} href={`/produse?brand=${encodeURIComponent(b.name)}`}
              className={`sidebar-link${activeBrand === b.name ? ' active' : ''}`}>
              {b.name}
            </Link>
          ))}
        </div>

      </aside>
    </>
  )
}
