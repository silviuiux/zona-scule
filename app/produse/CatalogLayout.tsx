'use client'
import type { ReactNode } from 'react'
import { ViewModeProvider, useViewMode } from './ViewModeContext'

/**
 * Wraps the sidebar/grid area of /produse and lets desktop visitors switch
 * between two states:
 *  - "pills":   (default) sidebar collapsed into a row of 3 dropdowns
 *               (brand/category/subcategory — CategoryPillBar.tsx), each
 *               cell the same width as a product card (same 4-col grid +
 *               gap as .products-grid). Product grid steps up to 4 columns
 *               since the fixed-width sidebar column is gone.
 *  - "sidebar": the classic vertical category/brand list (Sidebar.tsx).
 *               Reached only by clicking the switcher — never the default.
 *
 * The switcher button itself does NOT live in this row — it's rendered as
 * the first item of the subcategory pill bar instead (see
 * ViewSwitcherButton.tsx + page.tsx), which stays reachable via a shared
 * ViewModeContext regardless of where in the tree it renders.
 *
 * The dropdown row is sticky right under the navbar ONLY while no
 * category/brand is selected (`filterRowSticky`) — once one is, the
 * subcategory pill bar becomes the sticky row instead (see
 * SubcategoryBar.tsx's own `sticky` prop), so only one bar is ever pinned
 * at a time.
 */
function LayoutInner({
  sidebar,
  dropdowns,
  filterRowSticky,
  children,
}: {
  sidebar: ReactNode
  dropdowns: ReactNode
  filterRowSticky: boolean
  children: ReactNode
}) {
  const { mode } = useViewMode()

  return (
    <div className={`catalog-layout${mode === 'pills' ? ' pills-mode' : ''}`}>
      {sidebar}
      <main className="products-main">
        <div className={`filter-row${filterRowSticky ? ' is-sticky' : ''}`}>
          {dropdowns}
        </div>
        {children}
      </main>
    </div>
  )
}

export default function CatalogLayout(props: {
  sidebar: ReactNode
  dropdowns: ReactNode
  filterRowSticky: boolean
  children: ReactNode
}) {
  return (
    <>
      <style>{`
        /* Row of dropdown cells — matches .products-grid's 4-col template +
           gap so every cell lines up with a product card column below it.
           Normal-flow by default; .is-sticky pins it right under the navbar
           (only while nothing's filtered — see filterRowSticky above). */
        .filter-row {
          margin: 16px 0;
          padding: 0;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        .filter-row.is-sticky {
          position: sticky;
          top: 52px;
          z-index: 51;
          background: rgb(244, 244, 244);
        }

        /* Default (pills mode): sidebar list hidden, dropdown row shown,
           grid at 4 columns. Only on desktop — mobile always uses its own
           drawer + 2-col grid regardless of stored mode. */
        @media (min-width: 769px) {
          .catalog-layout.pills-mode .sidebar { display: none; }
          .catalog-layout.pills-mode .products-grid { grid-template-columns: repeat(4, 1fr); }
          /* Sidebar mode: dropdowns hidden, row collapses out entirely. */
          .catalog-layout:not(.pills-mode) .filter-row { display: none; }
        }

        @media (max-width: 768px) {
          .filter-row { display: none !important; }
        }
      `}</style>
      <ViewModeProvider>
        <LayoutInner {...props} />
      </ViewModeProvider>
    </>
  )
}
