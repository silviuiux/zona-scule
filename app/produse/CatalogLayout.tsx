'use client'
import type { ReactNode } from 'react'
import { useViewMode } from './ViewModeContext'

/**
 * Wraps the sidebar/grid area of /produse and switches (desktop only)
 * between three states, driven by ViewModeContext — the provider wraps the
 * whole page in page.tsx, since the switcher button (ViewSwitcherButton)
 * lives up in the hero's breadcrumb row:
 *  - "pills":   (default) no sidebar; category + brand pill carousels
 *               (CatalogFilterPills.tsx) above a 4-column product grid.
 *  - "tiles":   a brand menu, photo tiles per category and the picked
 *               category's subcategory panel (CatalogFilterTiles.tsx), over
 *               the same 4-column grid; the subcategory pill row is hidden.
 *  - "sidebar": the classic vertical category/brand list (Sidebar.tsx);
 *               the pill rows are hidden.
 */
export default function CatalogLayout({
  sidebar,
  filters,
  tiles,
  children,
}: {
  sidebar: ReactNode
  filters: ReactNode
  tiles: ReactNode
  children: ReactNode
}) {
  const { mode } = useViewMode()

  return (
    <>
      <style>{`
        .filter-row {
          margin: 24px 0 12px; /* 12px to the subcategory row, same as between rows */
        }
        /* 12px between the rows — margins, not flex gap: each row is preceded
           by a zero-height sticky sentinel that a gap would count too */
        .filter-row .subcat-scroller:not(:last-child) { margin-bottom: 12px; }

        /* Default (pills mode): sidebar list hidden, pill rows shown, grid
           at 4 columns. Only on desktop — mobile always uses its own
           drawer + 2-col grid regardless of stored mode. */
        @media (min-width: 769px) {
          .catalog-layout.pills-mode .sidebar { display: none; }
          .catalog-layout.pills-mode .products-grid { grid-template-columns: repeat(4, 1fr); }
          .catalog-layout:not(.pills-mode) .filter-row { display: none; }
          .catalog-layout.tiles-mode .sidebar { display: none; }
          .catalog-layout.tiles-mode .products-grid { grid-template-columns: repeat(4, 1fr); }
          .catalog-layout:not(.tiles-mode) .tiles-row { display: none; }
          /* the subcategory pill row: the tiles' panel stands in for it */
          .catalog-layout.tiles-mode .products-main > .subcat-sentinel,
          .catalog-layout.tiles-mode .products-main > .subcat-scroller { display: none; }
        }

        @media (max-width: 768px) {
          .filter-row, .tiles-row { display: none !important; }
        }
      `}</style>
      <div className={`catalog-layout${mode === 'pills' ? ' pills-mode' : mode === 'tiles' ? ' tiles-mode' : ''}`}>
        {sidebar}
        <main className="products-main">
          <div className="filter-row">{filters}</div>
          <div className="tiles-row">{tiles}</div>
          {children}
        </main>
      </div>
    </>
  )
}
