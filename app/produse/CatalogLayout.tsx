'use client'
import { useEffect, useState, type ReactNode } from 'react'

const STORAGE_KEY = 'produse-view-mode'
type ViewMode = 'sidebar' | 'pills'

/**
 * Wraps the sidebar/grid area of /produse and lets desktop visitors switch
 * between two states:
 *  - "pills":   (default) sidebar collapsed into a single sticky row —
 *               view switcher, brand/category/subcategory dropdowns
 *               (CategoryPillBar.tsx) — all four cells the same width as a
 *               product card (same 4-col grid + gap as .products-grid).
 *               Product grid steps up to 4 columns since the fixed-width
 *               sidebar column is gone.
 *  - "sidebar": the classic vertical category/brand list (Sidebar.tsx).
 *               Reached only by clicking the switcher — never the default.
 *
 * The switcher button always lives in the first cell of the sticky row (so
 * it's reachable from either mode); the three dropdowns are hidden via CSS
 * while in sidebar mode. Choice is remembered in localStorage; the mobile
 * drawer (Sidebar's own fixed-overlay CSS) is untouched — mode only affects
 * the desktop layout (see the min/max-width media queries below).
 */
export default function CatalogLayout({
  sidebar,
  dropdowns,
  children,
}: {
  sidebar: ReactNode
  dropdowns: ReactNode
  children: ReactNode
}) {
  const [mode, setMode] = useState<ViewMode>('pills')

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'pills' || saved === 'sidebar') setMode(saved)
  }, [])

  const toggleMode = () => {
    setMode(prev => {
      const next: ViewMode = prev === 'sidebar' ? 'pills' : 'sidebar'
      localStorage.setItem(STORAGE_KEY, next)
      return next
    })
  }

  return (
    <>
      <style>{`
        /* Sticky row: switcher + 3 dropdowns, all equal width — matches
           .products-grid's 4-col template + gap so every cell lines up with
           a product card column below it. Sticks right under the navbar. */
        .filter-row {
          position: sticky;
          top: 52px;
          z-index: 51;
          background: rgb(244, 244, 244);
          margin: 16px 0;
          padding: 8px 0;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        .view-toggle-btn {
          display: flex; align-items: center; justify-content: center;
          width: 100%; height: 100%;
          min-height: 40px;
          border-radius: 8px;
          background: rgb(255,255,255);
          border: 1px solid rgba(0,0,0,0.1);
          color: rgba(0,0,0,0.6);
          cursor: pointer;
          transition: color 150ms, border-color 150ms;
        }
        .view-toggle-btn:hover { color: rgb(0,0,0); border-color: rgba(0,0,0,0.3); }

        /* Default (pills mode): sidebar list hidden, dropdown row shown,
           grid at 4 columns. Only on desktop — mobile always uses its own
           drawer + 2-col grid regardless of stored mode. */
        @media (min-width: 769px) {
          .catalog-layout.pills-mode .sidebar { display: none; }
          .catalog-layout.pills-mode .products-grid { grid-template-columns: repeat(4, 1fr); }
          /* Sidebar mode: dropdowns hidden, row collapses to just the switcher cell. */
          .catalog-layout:not(.pills-mode) .cat-dropdown { display: none; }
          .catalog-layout:not(.pills-mode) .filter-row { grid-template-columns: max-content; }
        }

        @media (max-width: 768px) {
          .filter-row { display: none !important; }
        }
      `}</style>

      <div className={`catalog-layout${mode === 'pills' ? ' pills-mode' : ''}`}>
        {sidebar}
        <main className="products-main">
          <div className="filter-row">
            <button
              type="button"
              className="view-toggle-btn"
              onClick={toggleMode}
              aria-label={mode === 'pills' ? 'Comută la meniu lateral' : 'Comută la vizualizare compactă'}
              title={mode === 'pills' ? 'Meniu lateral' : 'Vizualizare compactă'}
            >
              {mode === 'pills' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="7" height="16" rx="1"/>
                  <rect x="13" y="4" width="8" height="7" rx="1"/>
                  <rect x="13" y="14" width="8" height="6" rx="1"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="6" height="16" rx="1"/>
                  <line x1="13" y1="8" x2="21" y2="8"/>
                  <line x1="13" y1="12" x2="21" y2="12"/>
                  <line x1="13" y1="16" x2="21" y2="16"/>
                </svg>
              )}
            </button>
            {dropdowns}
          </div>
          {children}
        </main>
      </div>
    </>
  )
}
