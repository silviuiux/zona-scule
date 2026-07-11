'use client'
import { useViewMode } from './ViewModeContext'

/**
 * Desktop-only sidebar/pills view switcher. Rendered as the first,
 * sticky-left item inside the subcategory pill row (SubcategoryBar) or the
 * standalone products-header fallback — same slot/positioning pattern as
 * MobileFilterToggle (which is the mobile equivalent, shown only <=768px).
 */
export default function ViewSwitcherButton() {
  const { mode, toggleMode } = useViewMode()

  return (
    <>
      <style>{`
        .view-switcher-btn {
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          width: 44px; height: 44px;
          border-radius: 10px;
          background: rgb(255,255,255);
          border: 1px solid rgba(0,0,0,0.1);
          color: rgba(0,0,0,0.6);
          cursor: pointer;
          position: sticky;
          left: 0;
          z-index: 2;
          transition: color 150ms, border-color 150ms;
        }
        .view-switcher-btn:hover { color: rgb(0,0,0); border-color: rgba(0,0,0,0.3); }

        @media (max-width: 768px) {
          .view-switcher-btn { display: none; }
        }
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
