'use client'
import { useEffect, useState, type ReactNode } from 'react'

const STORAGE_KEY = 'produse-view-mode'
type ViewMode = 'sidebar' | 'pills'

/**
 * Wraps the sidebar/grid area of /produse and lets desktop visitors switch
 * between two states:
 *  - "sidebar": the classic vertical category/brand list (Sidebar.tsx)
 *  - "pills":   sidebar collapsed into a horizontal pill carousel
 *               (CategoryPillBar.tsx), same visual language as the
 *               subcategory pills — and the product grid steps up to 4
 *               columns since the fixed-width sidebar column is gone.
 *
 * "pills" is the default view (collapsed sidebar). Choice is remembered in
 * localStorage; the mobile drawer (Sidebar's own fixed-overlay CSS) is
 * untouched — the mode only affects the desktop layout (see the
 * min/max-width media queries in the style block below).
 */
export default function CatalogLayout({
  sidebar,
  pillBar,
  children,
}: {
  sidebar: ReactNode
  pillBar: ReactNode
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
        .view-toggle-col {
          flex-shrink: 0;
          padding: 32px 0 0;
        }
        .view-toggle-btn {
          display: flex; align-items: center; justify-content: center;
          width: 36px; height: 36px;
          border-radius: 8px;
          background: rgb(255,255,255);
          border: 1px solid rgba(0,0,0,0.1);
          color: rgba(0,0,0,0.6);
          cursor: pointer;
          transition: color 150ms, border-color 150ms;
        }
        .view-toggle-btn:hover { color: rgb(0,0,0); border-color: rgba(0,0,0,0.3); }

        /* Default (pills mode): sidebar list hidden, pill carousel shown,
           grid at 4 columns. Only on desktop — mobile always uses its own
           drawer + 2-col grid regardless of stored mode. */
        @media (min-width: 769px) {
          .catalog-layout.pills-mode .sidebar { display: none; }
          .catalog-layout.pills-mode .products-grid { grid-template-columns: repeat(4, 1fr); }
          .catalog-layout:not(.pills-mode) .cat-pill-bar { display: none; }
        }

        @media (max-width: 768px) {
          .view-toggle-col { display: none; }
          .cat-pill-bar { display: none !important; }
        }
      `}</style>

      <div className={`catalog-layout${mode === 'pills' ? ' pills-mode' : ''}`}>
        <div className="view-toggle-col">
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
        </div>
        {sidebar}
        <main className="products-main">
          {pillBar}
          {children}
        </main>
      </div>
    </>
  )
}
