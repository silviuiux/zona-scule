'use client'
import { useEffect, useRef, useState } from 'react'
import { TransitionLink as Link } from '@/components/NavigationProgress'

/**
 * The tiles filter's brand row: one pill per brand (name only), toggling
 * like the pill rows (several brands OR together), "Toate" first. A
 * carousel sized so six and a half pills show — the half says "there's
 * more"; the square arrows on the right of the heading scroll it.
 */
export default function BrandRail({
  items,
  allHref,
  noneOn,
  label,
  reset,
}: {
  items: { name: string; on: boolean; href: string }[]
  allHref: string
  noneOn: boolean
  label: string
  reset?: React.ReactNode
}) {
  const track = useRef<HTMLDivElement>(null)
  const [edge, setEdge] = useState({ start: true, end: false })

  useEffect(() => {
    const el = track.current
    if (!el) return
    const update = () => setEdge({ start: el.scrollLeft <= 2, end: el.scrollLeft >= el.scrollWidth - el.clientWidth - 2 })
    update()
    el.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => { el.removeEventListener('scroll', update); window.removeEventListener('resize', update) }
  }, [])

  const by = (dir: number) => { const el = track.current; if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' }) }

  return (
    <div className="br">
      <style>{`
        .br { margin-bottom: 40px; }
        .br-head { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .br-label {
          font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10.5px; letter-spacing: 0.14em;
          text-transform: uppercase; color: rgba(0,0,0,0.4);
        }
        .br-arrows { margin-left: auto; display: flex; gap: 8px; }
        .br-head > .ft-reset { margin-left: auto; margin-right: 12px; }
        .br-head > .ft-reset ~ .br-arrows { margin-left: 0; }
        .br-arrow {
          width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;
          background: rgb(255,255,255); border: 1px solid rgba(0,0,0,0.08); border-radius: 4px; cursor: pointer; color: rgb(0,0,0);
          transition: border-color 150ms, opacity 150ms;
        }
        .br-arrow:hover { border-color: rgba(0,0,0,0.3); }
        .br-arrow:disabled { opacity: 0.35; cursor: default; }
        .br-track {
          display: flex; gap: 12px; overflow-x: auto; scroll-snap-type: x proximity;
          scrollbar-width: none; -ms-overflow-style: none;
        }
        .br-track::-webkit-scrollbar { display: none; }
        /* six and a half pills in view: slightly narrower than the
           category tiles (six to the row) */
        .br-pill {
          flex: 0 0 calc((100% - 6 * 12px) / 6.5);
          scroll-snap-align: start;
          display: flex; align-items: center; justify-content: center; height: 48px; padding: 0 14px;
          background: rgb(255,255,255); border: 1px solid rgba(0,0,0,0.1); border-radius: 4px;
          font-family: 'Recursive', sans-serif; font-size: 14px; color: rgb(0,0,0); text-decoration: none;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          transition: border-color 150ms, background 150ms, color 150ms;
        }
        .br-pill:hover { border-color: rgba(0,0,0,0.35); }
        .br-pill.on { background: rgb(0,0,0); border-color: rgb(0,0,0); color: rgb(255,255,255); }
        @media (max-width: 1200px) { .br-pill { flex-basis: calc((100% - 4 * 12px) / 4.5); } }
      `}</style>
      <div className="br-head">
        <span className="br-label">{label}</span>
        {reset}
        <div className="br-arrows">
          <button type="button" className="br-arrow" onClick={() => by(-1)} disabled={edge.start} aria-label="Brandurile anterioare">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <button type="button" className="br-arrow" onClick={() => by(1)} disabled={edge.end} aria-label="Brandurile următoare">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        </div>
      </div>
      <div ref={track} className="br-track">
        <Link href={allHref} className={`br-pill${noneOn ? ' on' : ''}`} aria-pressed={noneOn}>Toate</Link>
        {items.map(b => (
          <Link key={b.name} href={b.href} className={`br-pill${b.on ? ' on' : ''}`} aria-pressed={b.on}>{b.name}</Link>
        ))}
      </div>
    </div>
  )
}
