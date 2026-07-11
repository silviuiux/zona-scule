'use client'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

const STORAGE_KEY = 'produse-view-mode'
export type ViewMode = 'sidebar' | 'pills'

const ViewModeContext = createContext<{ mode: ViewMode; toggleMode: () => void } | null>(null)

/**
 * Owns the /produse sidebar-vs-pills view mode so the switcher button can
 * live anywhere in the tree — CatalogLayout (to toggle sidebar visibility +
 * grid columns) and ViewSwitcherButton (rendered as the first item of the
 * subcategory pill row) both consume this via useViewMode() instead of
 * prop-drilling a click handler between components that aren't otherwise
 * related.
 */
export function ViewModeProvider({ children }: { children: ReactNode }) {
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
    <ViewModeContext.Provider value={{ mode, toggleMode }}>
      {children}
    </ViewModeContext.Provider>
  )
}

export function useViewMode() {
  const ctx = useContext(ViewModeContext)
  if (!ctx) throw new Error('useViewMode must be used within ViewModeProvider')
  return ctx
}
