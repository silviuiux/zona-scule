'use client'
import type { ReactNode } from 'react'
import { useViewMode } from './ViewModeContext'

/**
 * Wraps the sidebar/grid area of /produse and switches (desktop only)
 * between two states, driven by ViewModeContext — the provider wraps the
 * whole page in page.tsx, since the switcher button (ViewSwitcherButton)
 * lives up in the hero's breadcrumb row:
 *  - "pills":   (default) no sidebar; category + brand pill carousels
 *               (CatalogFilterPills.tsx) above a 4-column product grid.
 *  - "sidebar": the classic vertical category/brand list (Sidebar.tsx);
 *               the pill rows are hidden.
 */
export default function CatalogLayout({
  sidebar,
  filters,
  children,
}: {
  sidebar: ReactNode
  filters: ReactNode
  children: ReactNode
}) {
  const { mode } = useViewMode()

  return (
    <>
      <style>{`
        .filter-row {
          margin: 24px 0 32px;
          display: flex; flex-direction: column; gap: 12px;
        }

        /* Default (pills mode): sidebar list hidden, pill rows shown, grid
           at 4 columns. Only on desktop — mobile always uses its own
           drawer + 2-col grid regardless of stored mode. */
        @media (min-width: 769px) {
          .catalog-layout.pills-mode .sidebar { display: none; }
          .catalog-layout.pills-mode .products-grid { grid-template-columns: repeat(4, 1fr); }
          .catalog-layout:not(.pills-mode) .filter-row { display: none; }
        }

        @media (max-width: 768px) {
          .filter-row { display: none !important; }
        }
      `}</style>
      <div className={`catalog-layout${mode === 'pills' ? ' pills-mode' : ''}`}>
        {sidebar}
        <main className="products-main">
          <div className="filter-row">{filters}</div>
          {children}
        </main>
      </div>
    </>
  )
}
