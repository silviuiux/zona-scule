'use client'
import { useViewMode, VIEW_MODES, type ViewMode } from './ViewModeContext'

const LABEL: Record<ViewMode, string> = { pills: 'Rânduri de filtre', tiles: 'Categorii cu imagini', sidebar: 'Meniu lateral' }

/**
 * Desktop-only filter-layout switcher (pill rows → category tiles →
 * sidebar → …): a square icon button
 * sitting before the "Catalog" breadcrumb pill, on the same line and at the
 * same height (see .cat-breadcrumb in page.tsx). Mobile uses the filter
 * drawer instead, so it's hidden there.
 */
export default function ViewSwitcherButton() {
  const { mode, toggleMode } = useViewMode()
  // the icon and label name the layout the next click switches to
  const next = VIEW_MODES[(VIEW_MODES.indexOf(mode) + 1) % VIEW_MODES.length]

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
        aria-label={`Comută la: ${LABEL[next]}`}
        title={LABEL[next]}
      >
        {next === 'sidebar' ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="6" height="16" rx="1"/>
            <line x1="13" y1="8" x2="21" y2="8"/>
            <line x1="13" y1="12" x2="21" y2="12"/>
            <line x1="13" y1="16" x2="21" y2="16"/>
          </svg>
        ) : next === 'tiles' ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="8" height="7" rx="1"/>
            <rect x="13" y="4" width="8" height="7" rx="1"/>
            <rect x="3" y="13" width="8" height="7" rx="1"/>
            <rect x="13" y="13" width="8" height="7" rx="1"/>
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="5" width="18" height="4" rx="1"/>
            <rect x="3" y="11" width="12" height="4" rx="1"/>
            <rect x="3" y="17" width="15" height="4" rx="1"/>
          </svg>
        )}
      </button>
    </>
  )
}
