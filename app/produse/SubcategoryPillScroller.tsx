'use client'
import { useRef, useEffect, type ReactNode } from 'react'

/**
 * Client-only scroll behavior wrapper around SubcategoryBar's pill row.
 * Kept separate from SubcategoryBar (an async server component that fetches
 * the subcategory list) since wheel listeners / refs need a client boundary.
 *
 * - Wheel-scroll: while the cursor is over the row, vertical (or trackpad
 *   horizontal) wheel input drives the pill row's native scrollLeft instead
 *   of the page — only when the row actually has overflow, so pages with a
 *   short pill list that fits don't swallow page-scroll for no reason.
 * - Arrow buttons: desktop-only (matches the homepage subcategory carousel),
 *   jump 85% of the visible row width per click via native smooth scrollBy.
 */
export default function SubcategoryPillScroller({
  className,
  children,
}: {
  className: string
  children: ReactNode
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth) return // nothing to scroll — let the page handle it
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
      if (delta === 0) return
      // Stop this from also scrolling the page (both as the native wheel
      // action and as a bubbled scroll-chain once the row hits either end).
      e.preventDefault()
      e.stopPropagation()
      el.scrollLeft += delta
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const scrollByAmount = (dir: 1 | -1) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: el.clientWidth * 0.85 * dir, behavior: 'smooth' })
  }

  return (
    <div className="subcat-scroller">
      <style>{`
        .subcat-scroller {
          position: relative;
          /* Side padding makes room for the arrows to sit fully outside the
             pill row itself (not overlapping any pill). Unlike the homepage
             carousel this component isn't a full-bleed breakout, so this
             padding isn't canceled with a negative margin — it just trims
             the row's own width slightly, which is fine since .products-main
             has plenty of spare width to give up. */
          padding: 0 44px;
        }

        .subcat-arrow {
          display: none;
          position: absolute;
          top: 50%; transform: translateY(-50%);
          /* Above both this row's own sticky z-index (50) and the filter
             row's (51) — otherwise the sticky pill row painted on top of it
             and the arrows looked like they were sitting "behind" the pills. */
          z-index: 60;
          width: 36px; height: 36px;
          align-items: center; justify-content: center;
          border-radius: 50%;
          background: rgba(255,255,255,0.95);
          -webkit-backdrop-filter: blur(4px);
          backdrop-filter: blur(4px);
          border: 1px solid rgba(0,0,0,0.08);
          box-shadow: 0 6px 18px rgba(0,0,0,0.1);
          color: rgba(0,0,0,0.55);
          cursor: pointer;
          transition: color 150ms, background 150ms, box-shadow 150ms;
        }
        .subcat-arrow:hover {
          color: rgb(0,0,0);
          background: rgb(255,255,255);
          box-shadow: 0 10px 24px rgba(0,0,0,0.16);
        }
        .subcat-arrow-left { left: 0; }
        .subcat-arrow-right { right: 0; }

        @media (min-width: 1024px) {
          .subcat-arrow { display: flex; }
        }
      `}</style>

      <button
        type="button"
        className="subcat-arrow subcat-arrow-left"
        onClick={() => scrollByAmount(-1)}
        aria-label="Derulează spre stânga"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      <div ref={scrollRef} className={className}>
        {children}
      </div>

      <button
        type="button"
        className="subcat-arrow subcat-arrow-right"
        onClick={() => scrollByAmount(1)}
        aria-label="Derulează spre dreapta"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  )
}
