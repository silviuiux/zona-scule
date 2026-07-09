'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function HeroSearch({ totalCount }: { totalCount?: number }) {
  const [q, setQ] = useState('')
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const active = q.trim().length > 0

  const submit = () => {
    if (q.trim()) router.push(`/produse?q=${encodeURIComponent(q.trim())}`)
    else router.push('/produse')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submit()
  }

  const clear = () => {
    setQ('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape' && q) {
      e.preventDefault()
      clear()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="hero-search-box">
      <style>{`
        /* Left icon flips search → clear once the field has content */
        .hero-search-clear { color: rgba(0,0,0,0.4); }
        .hero-search-clear:hover { color: rgb(217,44,43); }

        /* Right-side "go" affordance — always present as a subtle CTA hint,
           lights up red + nudges right once there's a query to run. */
        .hero-search-go {
          flex-shrink: 0; background: none; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          padding: 0 2px; color: rgba(0,0,0,0.22);
          transition: color 150ms, transform 220ms cubic-bezier(0.22,1,0.36,1);
        }
        .hero-search-go:hover { color: rgb(217,44,43); }
        .hero-search-go.active { color: rgb(217,44,43); transform: translateX(3px); }
      `}</style>

      {/* Left icon: search when empty (submits), clear-X when active */}
      {active ? (
        <button
          type="button"
          className="hero-search-icon hero-search-clear"
          onClick={clear}
          aria-label="Sterge cautarea"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      ) : (
        <button type="submit" className="hero-search-icon" aria-label="Cauta">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
        </button>
      )}

      <div className="hero-search-input-wrap">
        <input
          ref={inputRef}
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder=""
          autoComplete="off"
          spellCheck={false}
        />
        {!q && (
          <span className="hero-search-placeholder">
            {totalCount ? (
              <>cauta in <span className="hero-search-placeholder-count">{totalCount.toLocaleString('ro')}</span> de scule, unelte sau accesorii</>
            ) : 'cauta scule, branduri, accesorii'}
          </span>
        )}
      </div>

      {/* Right-side CTA arrow — signals "search" */}
      <button
        type="submit"
        className={`hero-search-go${active ? ' active' : ''}`}
        aria-label="Cauta"
        tabIndex={-1}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </button>
    </form>
  )
}
