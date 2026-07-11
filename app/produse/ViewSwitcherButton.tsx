'use client'
import { useViewMode } from './ViewModeContext'

/**
 * Desktop-only pills-mode ↔ sidebar-mode switcher. Rendered as the first
 * cell of CatalogLayout's ".filter-row" grid, alongside the brand/category/
 * subcategory dropdowns — same fill-width/height styling as those cells so
 * all four line up as equal columns. The sidebar-mode equivalent is a
 * separate, differently-styled control (SidebarViewToggle.tsx) rendered
 * inside Sidebar.tsx itself.
 */
export default function ViewSwitcherButton() {
  const { mode, toggleMode } = useViewMode()

  return (
    <>
      <style>{`
        .view-switcher-btn {
          display: flex; align-items: center; justify-content: center;
          width: 100%;
          min-height: 40px;
          border-radius: 8px;
          background: rgb(255,255,255);
          border: 1px solid rgba(0,0,0,0.12);
          color: rgba(0,0,0,0.6);
          cursor: pointer;
          transition: color 150ms, border-color 150ms;
        }
        .view-switcher-btn:hover { color: rgb(0,0,0); border-color: rgba(0,0,0,0.3); }
      `}</style>
      <button
        type="button"
        className="view-switcher-btn"
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
    </>
  )
}
