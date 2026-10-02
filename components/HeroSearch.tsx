'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { HERO_WORD_EVENT } from './AnimatedHero'

/**
 * The hero's search field. Its placeholder follows the rotating headline
 * word: "Toate sculele…" → "caută în 8.191 de scule și alte 49.136 de
 * produse" (the rest of the catalog), both counts rolling to the next
 * figures whenever the word changes.
 */
export default function HeroSearch({ totalCount, initial }: { totalCount?: number; initial?: { count: number; noun: string } }) {
  const [q, setQ] = useState('')
  const [noun, setNoun] = useState(initial?.noun ?? 'produse')
  const [shown, setShown] = useState(initial?.count ?? totalCount ?? 0)
  const shownRef = useRef(shown)

  useEffect(() => {
    let raf = 0
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const onWord = (e: Event) => {
      const { count, noun } = (e as CustomEvent<{ count: number; noun: string }>).detail
      setNoun(noun)
      cancelAnimationFrame(raf)
      const from = shownRef.current, t0 = performance.now(), D = 700
      const step = (now: number) => {
        const k = reduce ? 1 : Math.min(1, (now - t0) / D)
        const v = Math.round(from + (count - from) * (1 - Math.pow(1 - k, 3)))
        shownRef.current = v
        setShown(v)
        if (k < 1) raf = requestAnimationFrame(step)
      }
      raf = requestAnimationFrame(step)
    }
    window.addEventListener(HERO_WORD_EVENT, onWord)
    return () => { window.removeEventListener(HERO_WORD_EVENT, onWord); cancelAnimationFrame(raf) }
  }, [])
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
      `}</style>

      {/* Icon + input. A layout no-op on desktop (display: contents);
          on mobile it becomes the bordered field above the full-width
          button (see the hero styles in app/page.tsx). */}
      <div className="hero-search-field">
        {/* Left icon: search when empty (submits), clear-X when active */}
        {active ? (
          <button
            type="button"
            className="hero-search-icon hero-search-clear"
            onClick={clear}
            aria-label="Șterge căutarea"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        ) : (
          <button type="submit" className="hero-search-icon" aria-label="Caută">
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
              {shown ? (
                <>
                  caută în <span className="hero-search-placeholder-count">{shown.toLocaleString('ro')}</span> de {noun}
                  {totalCount && totalCount > shown ? (
                    <span className="hero-search-placeholder-rest"> și alte <span className="hero-search-placeholder-count">{(totalCount - shown).toLocaleString('ro')}</span> de produse</span>
                  ) : null}
                </>
              ) : 'caută scule, branduri, accesorii'}
            </span>
          )}
        </div>
      </div>

      {/* Red CTA — submits the typed query when there is one, otherwise
          just opens the full catalog. Lives in the same <form> as the
          input so Enter and a click behave identically. */}
      <button type="submit" className="hero-catalog-cta">Vezi catalog</button>
    </form>
  )
}
