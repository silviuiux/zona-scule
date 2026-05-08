'use client'

export function MobileFilterToggle() {
  return (
    <button
      className="sidebar-toggle"
      onClick={() => {
        document.querySelector('.sidebar')?.classList.toggle('open')
        document.getElementById('sidebar-backdrop')?.classList.toggle('open')
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="6" y1="12" x2="18" y2="12" />
        <line x1="9" y1="18" x2="15" y2="18" />
      </svg>
      Filtre
    </button>
  )
}

export function MobileFilterBackdrop() {
  return (
    <div
      className="sidebar-backdrop"
      id="sidebar-backdrop"
      onClick={() => {
        document.querySelector('.sidebar')?.classList.remove('open')
        document.getElementById('sidebar-backdrop')?.classList.remove('open')
      }}
    />
  )
}
