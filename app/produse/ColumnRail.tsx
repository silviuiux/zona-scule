'use client'
import { useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * Horizontal carousel of list columns (the tiles panel's subcategories,
 * 12 rows to a column). Four columns in view, arrows in the panel's side
 * padding when there are more; trackpads and touch scroll it natively.
 */
export default function ColumnRail({ children, label }: { children: ReactNode; label: string }) {
  const track = useRef<HTMLDivElement>(null)
  const [edge, setEdge] = useState({ start: true, end: true })

  useEffect(() => {
    const el = track.current
    if (!el) return
    const update = () => setEdge({ start: el.scrollLeft <= 2, end: el.scrollLeft >= el.scrollWidth - el.clientWidth - 2 })
    update()
    el.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => { el.removeEventListener('scroll', update); window.removeEventListener('resize', update) }
  }, [])

  const by = (dir: number) => {
    const el = track.current
    if (!el) return
    const col = el.firstElementChild as HTMLElement | null
    const step = col ? col.getBoundingClientRect().width + 32 : el.clientWidth
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  const scrollable = !(edge.start && edge.end)

  return (
    <div className="cr">
      <style>{`
        .cr { position: relative; }
        .cr-track {
          display: grid; grid-auto-flow: column; grid-auto-columns: calc((100% - 3 * 32px) / 4);
          column-gap: 32px; align-items: start;
          overflow-x: auto; scroll-snap-type: x mandatory; overscroll-behavior-x: contain;
          scrollbar-width: none; -ms-overflow-style: none;
        }
        .cr-track::-webkit-scrollbar { display: none; }
        .cr-track > * { scroll-snap-align: start; min-width: 0; }
        .cr-arrow {
          position: absolute; top: 50%; z-index: 2; transform: translateY(-50%);
          width: 26px; height: 48px; display: flex; align-items: center; justify-content: center;
          background: transparent; border: none; border-radius: 4px; cursor: pointer; color: rgb(0,0,0);
          transition: background 150ms, opacity 150ms;
        }
        .cr-arrow:hover { background: rgba(0,0,0,0.05); }
        .cr-arrow:disabled { opacity: 0.2; cursor: default; background: transparent; }
        .cr-arrow.prev { left: -30px; }
        .cr-arrow.next { right: -30px; }
        @media (max-width: 1200px) { .cr-track { grid-auto-columns: calc((100% - 2 * 32px) / 3); } }
      `}</style>
      {scrollable && (
        <button type="button" className="cr-arrow prev" onClick={() => by(-1)} disabled={edge.start} aria-label={`${label}: coloanele anterioare`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
      )}
      <div ref={track} className="cr-track">{children}</div>
      {scrollable && (
        <button type="button" className="cr-arrow next" onClick={() => by(1)} disabled={edge.end} aria-label={`${label}: coloanele următoare`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
        </button>
      )}
    </div>
  )
}
