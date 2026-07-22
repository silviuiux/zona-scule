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
      e.preventDefault()
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
        .subcat-scroller { position: relative; }

        .subcat-arrow {
          display: none;
          position: absolute;
          top: 50%; transform: translateY(-50%);
          z-index: 4;
          width: 36px; height: 36px;
          align-items: center; justify-content: center;
          border-radius: 50%;
          background: rgba(255,255,255,0.92);
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
        .subcat-arrow-left { left: -14px; }
        .subcat-arrow-right { right: -14px; }

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
