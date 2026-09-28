'use client'
import { useEffect, useRef, useState } from 'react'
import { TransitionLink as Link } from '@/components/NavigationProgress'

/**
 * The tiles filter's brand control: one compact button ("Brand: Toate ▾")
 * opening a list of brands with counts; picks toggle (several brands OR
 * together, like the pill rows). Closes on an outside click or Escape.
 */
export default function BrandMenu({
  items,
  label,
  clearHref,
}: {
  items: { name: string; count: number; on: boolean; href: string }[]
  label: string
  clearHref: string | null
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open])

  return (
    <div ref={ref} className={`bm${open ? ' open' : ''}`}>
      <style>{`
        .bm { position: relative; }
        .bm-btn {
          display: inline-flex; align-items: center; gap: 12px; height: 44px; padding: 0 18px;
          background: rgb(255,255,255); border: 1px solid rgba(0,0,0,0.1); border-radius: 4px; cursor: pointer;
          font-family: 'Recursive', sans-serif; font-size: 13px; color: rgb(0,0,0);
          transition: border-color 150ms;
        }
        .bm-btn:hover, .bm.open .bm-btn { border-color: rgba(0,0,0,0.4); }
        .bm-btn span { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10.5px; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(0,0,0,0.45); }
        .bm-btn svg { transition: transform 200ms; }
        .bm.open .bm-btn svg { transform: rotate(180deg); }
        .bm-panel {
          position: absolute; top: calc(100% + 8px); left: 0; z-index: 70;
          width: 560px; max-width: calc(100vw - 2 * var(--gutter));
          background: rgb(255,255,255); border: 1px solid rgba(0,0,0,0.1); border-radius: 4px;
          box-shadow: 0 18px 48px rgba(0,0,0,0.1);
          padding: 12px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 2px 12px;
          max-height: 60vh; overflow-y: auto;
        }
        .bm-item {
          display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 4px;
          font-family: 'Recursive', sans-serif; font-size: 13px; color: rgba(0,0,0,0.75); text-decoration: none;
        }
        .bm-item:hover { background: rgb(244,244,244); color: rgb(0,0,0); }
        .bm-box { width: 14px; height: 14px; border: 1px solid rgba(0,0,0,0.3); border-radius: 3px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
        .bm-item.on { color: rgb(0,0,0); }
        .bm-item.on .bm-box { background: rgb(0,0,0); border-color: rgb(0,0,0); }
        .bm-count { margin-left: auto; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; color: rgba(0,0,0,0.38); }
        .bm-clear { grid-column: 1 / -1; border-top: 1px solid rgba(0,0,0,0.08); margin-top: 8px; padding-top: 14px; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; }
      `}</style>
      <button type="button" className="bm-btn" aria-expanded={open} onClick={() => setOpen(o => !o)}>
        <span>Brand</span>{label}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m6 9 6 6 6-6" /></svg>
      </button>
      {open && (
        <div className="bm-panel">
          {items.map(b => (
            <Link key={b.name} href={b.href} className={`bm-item${b.on ? ' on' : ''}`} aria-pressed={b.on}>
              <span className="bm-box">{b.on && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"><path d="m5 12 5 5 9-10" /></svg>}</span>
              {b.name}<span className="bm-count">{b.count.toLocaleString('ro')}</span>
            </Link>
          ))}
          {clearHref && <Link href={clearHref} className="bm-item bm-clear" onClick={() => setOpen(false)}>× Toate brandurile</Link>}
        </div>
      )}
    </div>
  )
}
