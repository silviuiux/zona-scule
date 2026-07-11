'use client'
import { useViewMode } from './ViewModeContext'

/**
 * First item inside the vertical Sidebar (Sidebar.tsx) — full sidebar
 * width, switches back to the pills/dropdown view. The pills-mode
 * equivalent is ViewSwitcherButton.tsx (icon-only, lives in the filter-row
 * grid instead). Both share the same ViewModeContext.
 */
export default function SidebarViewToggle() {
  const { toggleMode } = useViewMode()

  return (
    <>
      <style>{`
        .sidebar-view-toggle {
          display: flex; align-items: center; gap: 10px;
          width: 100%;
          padding: 12px 14px;
          margin-bottom: 20px;
          border-radius: 8px;
          background: rgb(255,255,255);
          border: 1px solid rgba(0,0,0,0.12);
          color: rgba(0,0,0,0.7);
          font-family: 'Recursive', sans-serif;
          font-size: 13px; font-weight: 500;
          cursor: pointer;
          transition: color 150ms, border-color 150ms;
        }
        .sidebar-view-toggle:hover { color: rgb(0,0,0); border-color: rgba(0,0,0,0.3); }
        .sidebar-view-toggle svg { flex-shrink: 0; }
      `}</style>
      <button type="button" className="sidebar-view-toggle" onClick={toggleMode}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="7" height="16" rx="1"/>
          <rect x="13" y="4" width="8" height="7" rx="1"/>
          <rect x="13" y="14" width="8" height="6" rx="1"/>
        </svg>
        <span>Afișare filtre</span>
      </button>
    </>
  )
}
