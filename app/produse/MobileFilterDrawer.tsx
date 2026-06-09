'use client'
import { useEffect, useState } from 'react'

/** Mobile filter drawer controls. The sidebar itself is server-rendered;
 *  these toggle its `.open` class and manage a11y state (Escape, scroll
 *  lock, aria-expanded). */

function setOpen(open: boolean) {
  document.querySelector('.sidebar')?.classList.toggle('open', open)
  document.getElementById('sidebar-backdrop')?.classList.toggle('open', open)
  document.body.style.overflow = open ? 'hidden' : ''
}

export function MobileFilterToggle() {
  const [open, setOpenState] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); setOpenState(false) }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  // Clean up scroll lock if unmounted while open (e.g. navigation)
  useEffect(() => () => { document.body.style.overflow = '' }, [])

  return (
    <button
      className="sidebar-toggle"
      aria-label="Filtre produse"
      aria-expanded={open}
      onClick={() => {
        const next = !open
        setOpen(next)
        setOpenState(next)
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="6" y1="12" x2="18" y2="12" />
        <line x1="9" y1="18" x2="15" y2="18" />
      </svg>
      <span style={{
        fontFamily: 'var(--font-inter), sans-serif', fontSize: 12, fontWeight: 600,
        letterSpacing: '0.06em', textTransform: 'uppercase', marginLeft: 6,
      }}>Filtre</span>
    </button>
  )
}

export function MobileFilterBackdrop() {
  return (
    <div
      className="sidebar-backdrop"
      id="sidebar-backdrop"
      aria-hidden="true"
      onClick={() => setOpen(false)}
    />
  )
}
