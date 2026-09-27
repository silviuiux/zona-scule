'use client'
import { useViewMode } from './ViewModeContext'

/**
 * Desktop-only pills-mode ↔ sidebar-mode switcher: a square icon button
 * sitting before the "Catalog" breadcrumb pill, on the same line and at the
 * same height (see .cat-breadcrumb in page.tsx). Mobile uses the filter
 * drawer instead, so it's hidden there.
 */
export default function ViewSwitcherButton() {
  const { mode, toggleMode } = useViewMode()

  return (
    <>
      <style>{`
        .view-switcher-btn {
          display: inline-flex; align-items: center; justify-content: center;
          width: 28px; height: 28px; flex-shrink: 0; padding: 0;
          border-radius: 4px;
          background: rgb(255,255,255);
          border: 1px solid rgba(0,0,0,0.18);
          color: rgba(0,0,0,0.55);
          cursor: pointer;
          transition: color 150ms, border-color 150ms;
        }
        .view-switcher-btn:hover { color: rgb(0,0,0); border-color: rgba(0,0,0,0.4); }
        @media (max-width: 768px) { .view-switcher-btn { display: none; } }
      `}</style>
      <button
        type="button"
        className="view-switcher-btn"
        onClick={toggleMode}
        aria-label={mode === 'pills' ? 'Comută la meniu lateral' : 'Comută la vizualizare compactă'}
        title={mode === 'pills' ? 'Meniu lateral' : 'Vizualizare compactă'}
      >
        {mode === 'pills' ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="7" height="16" rx="1"/>
            <rect x="13" y="4" width="8" height="7" rx="1"/>
            <rect x="13" y="14" width="8" height="6" rx="1"/>
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
