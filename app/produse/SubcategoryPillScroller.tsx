'use client'
import { useRef, useEffect, useState, type ReactNode } from 'react'

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
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [stuck, setStuck] = useState(false)
  // Only the sticky variant of this bar ever needs stuck-detection — the
  // non-sticky "Toate" row (sticky={false} in SubcategoryBar) has nothing to
  // detect and should never gain the stuck-only white card treatment below.
  const isSticky = className.includes('is-sticky')

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

  // Detects whether the (position: sticky) row is actually pinned right now
  // — CSS alone can't tell "sticky in normal flow" from "currently stuck",
  // so a 1px sentinel just above the row is watched via IntersectionObserver:
  // once it scrolls past the sticky offset (52px navbar height) and leaves
  // the viewport, the row itself must be pinned. Drives the `.stuck` class
  // that swaps in a white backdrop + shadow only while actually pinned,
  // leaving the row transparent (blending with the gray listing background)
  // the rest of the time.
  useEffect(() => {
    if (!isSticky) {
      setStuck(false)
      return
    }
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting),
      { rootMargin: '-53px 0px 0px 0px', threshold: 0 }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [isSticky])

  const scrollByAmount = (dir: 1 | -1) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: el.clientWidth * 0.85 * dir, behavior: 'smooth' })
  }

  return (
    <div className={`subcat-scroller${stuck ? ' stuck' : ''}`}>
      <style>{`
        .subcat-scroller {
          position: relative;
        }

        /* Only visible while .stuck is applied (actually pinned under the
           navbar, per the IntersectionObserver above) — gives the whole
           wrapper, arrow gutters included, the same white card + shadow as
           the pinned pill row (see SubcategoryBar.tsx's .subcat-bar.is-
           sticky.stuck) so the arrows read as part of that pinned card
           instead of floating loose over the gray page background. */
        .subcat-scroller.stuck {
          background: rgb(255, 255, 255);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }

        /* 1px, non-interactive — sits in normal flow at the very top of
           this (non-sticky) wrapper so it scrolls with the page while the
           pill row inside pins in place. Once it crosses the rootMargin
           threshold above and leaves the viewport, the row must be stuck. */
        .subcat-sentinel {
          position: absolute;
          top: 0; left: 0;
          width: 1px; height: 1px;
          pointer-events: none;
        }

        /* Side padding insets the pill row so the arrows have dedicated
           space to sit in — fully clear of every pill, not overlapping the
           first/last one. Applied only at the width the arrows actually
           render (≥1024px, see below) so mobile/tablet don't lose width to
           an inset with nothing occupying it. Absolute-positioned children
           offset from a padding-box edge (left/right: 0 below), so this is
           enough on its own — no negative-margin breakout needed since we
           want the row to shrink into the existing footprint, not for the
           wrapper to grow past it. */
        @media (min-width: 1024px) {
          .subcat-scroller { padding: 0 48px; }
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
        .subcat-arrow-left { left: 4px; }
        .subcat-arrow-right { right: 4px; }

        @media (min-width: 1024px) {
          .subcat-arrow { display: flex; }
        }
      `}</style>

      <div ref={sentinelRef} className="subcat-sentinel" aria-hidden="true" />

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

      <div ref={scrollRef} className={`${className}${stuck ? ' stuck' : ''}`}>
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
