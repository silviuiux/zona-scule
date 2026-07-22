'use client'
import Link from 'next/link'
import { useRef, useEffect } from 'react'
import type { FeaturedSubcategoryWithImage } from '@/lib/supabase'

// easeOutCubic — used for both the arrow-click jump and the wheel-scroll's
// momentary "settle" back to the ambient auto-scroll.
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

export default function SubcategoryCarousel({ subs }: { subs: FeaturedSubcategoryWithImage[] }) {
  const doubled = [...subs, ...subs]
  const outerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const hasDragged = useRef(false)
  // Exposed so the arrow buttons (rendered outside the effect) can trigger
  // an eased jump without re-running the whole setup effect.
  const jumpRef = useRef<(dir: 1 | -1) => void>(() => {})

  useEffect(() => {
    const outer = outerRef.current
    const track = trackRef.current
    if (!outer || !track || subs.length === 0) return

    const SPEED = 0.7  // px per rAF tick ≈ 42 px/s @ 60 fps
    let x = 0
    let isDragging = false
    let startClientX = 0
    let startX = 0
    let raf: number

    // Paused (no ambient auto-scroll) until this timestamp — set whenever
    // the visitor actively drives the carousel themselves (wheel or arrow
    // click), so their input doesn't immediately get fought by the
    // constant auto-advance.
    let pausedUntil = 0

    // Eased jump state — driven by the arrow buttons. Runs alongside the
    // rAF tick loop instead of a CSS transition, since transform is also
    // being set imperatively every frame for the ambient auto-scroll.
    let jump: { from: number; to: number; start: number; duration: number } | null = null

    const cardW = () => window.innerWidth <= 768 ? 192 + 12 : 284 + 12
    const totalW = () => subs.length * cardW()
    const wrap = () => {
      const tw = totalW()
      if (x < -tw * 1.5) x += tw
      if (x > tw * 0.5) x -= tw
    }

    const tick = () => {
      const now = performance.now()
      if (jump) {
        const t = Math.min(1, (now - jump.start) / jump.duration)
        x = jump.from + (jump.to - jump.from) * easeOutCubic(t)
        if (t >= 1) { jump = null; wrap() }
      } else if (!isDragging && now > pausedUntil) {
        x -= SPEED
        wrap()
      }
      track.style.transform = `translateX(${x}px)`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    // ── Arrow buttons — jump ~85% of the visible (viewport) width ───────────
    jumpRef.current = (dir: 1 | -1) => {
      const visible = outer.clientWidth
      // dir=1 (right arrow) advances the same direction as the ambient
      // auto-scroll (x decreasing); dir=-1 (left arrow) reverses it.
      const to = x - visible * 0.85 * dir
      jump = { from: x, to, start: performance.now(), duration: 450 }
      pausedUntil = performance.now() + 450 + 400
    }

    // ── Wheel — vertical (or trackpad horizontal) scroll drives the
    //     carousel instead of the page, for as long as the cursor is over it.
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
      x -= delta
      wrap()
      jump = null
      pausedUntil = performance.now() + 500
    }

    // ── Mouse drag ──────────────────────────────────────────────────────────
    const onMouseDown = (e: MouseEvent) => {
      isDragging = true
      jump = null
      hasDragged.current = false
      startClientX = e.clientX
      startX = x
      track.style.cursor = 'grabbing'
    }
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      const delta = e.clientX - startClientX
      if (Math.abs(delta) > 4) hasDragged.current = true
      x = startX + delta
      wrap()
    }
    const onMouseUp = () => {
      isDragging = false
      pausedUntil = performance.now() + 300
      track.style.cursor = 'grab'
    }

    // ── Touch drag ───────────────────────────────────────────────────────────
    const onTouchStart = (e: TouchEvent) => {
      isDragging = true
      jump = null
      hasDragged.current = false
      startClientX = e.touches[0].clientX
      startX = x
    }
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging) return
      const delta = e.touches[0].clientX - startClientX
      if (Math.abs(delta) > 4) hasDragged.current = true
      x = startX + delta
      wrap()
    }
    const onTouchEnd = () => {
      isDragging = false
      pausedUntil = performance.now() + 300
    }

    // Block link navigation after a real drag
    const onClickCapture = (e: MouseEvent) => {
      if (hasDragged.current) { e.preventDefault(); e.stopPropagation() }
    }

    track.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    track.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd)
    track.addEventListener('click', onClickCapture, true)
    outer.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      cancelAnimationFrame(raf)
      track.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      track.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      track.removeEventListener('click', onClickCapture, true)
      outer.removeEventListener('wheel', onWheel)
    }
  }, [subs.length])

  return (
    <>
      <style>{`
        /* Full-width breakout from the max-width container */
        .sub-carousel-outer {
          position: relative;
          left: 50%;
          transform: translateX(-50%);
          width: 100vw;
          overflow: hidden;
        }

        .sub-carousel-track {
          display: flex;
          gap: 0;
          /* padding-left aligns first card with the header above */
          padding-left: max(32px, calc(50vw - 720px + 24px));
          will-change: transform;
          cursor: grab;
          user-select: none;
          -webkit-user-select: none;
        }
        .sub-carousel-track:active { cursor: grabbing; }

        .sub-card {
          flex-shrink: 0;
          width: 284px; height: 398px;
          margin-right: 12px;
          position: relative; overflow: hidden;
          border-radius: 8px;
          background: rgb(255,255,255);
          text-decoration: none; display: block;
          transition: transform 300ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .sub-card:hover { transform: scale(1.02); }
        .sub-card-img {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover; object-position: center;
          display: block;
          transition: transform 600ms cubic-bezier(0.22, 1, 0.36, 1);
          pointer-events: none;
        }
        .sub-card:hover .sub-card-img { transform: scale(1.06); }
        .sub-card-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.15) 50%, transparent 80%);
        }
        .sub-card-bottom {
          position: absolute; bottom: 0; left: 0; right: 0; padding: 14px;
        }
        .sub-card-count {
          font-family: 'Inter', sans-serif;
          font-size: 10px; font-weight: 600; letter-spacing: 0.06em;
          text-transform: uppercase; color: rgba(255,255,255,0.5);
          display: block; margin-bottom: 4px;
        }
        .sub-card-label {
          font-family: 'Recursive', sans-serif;
          font-size: 14px; font-weight: 500;
          color: rgb(255,255,255); line-height: 1.3; display: block;
        }

        /* ── Arrows — subtle, desktop-only, sit in the gutter between the
             readable content edge and the viewport edge, vertically
             centered against the (desktop) card height. ── */
        .sub-carousel-arrow {
          display: none;
          position: absolute;
          top: 50%; transform: translateY(-50%);
          z-index: 3;
          width: 44px; height: 44px;
          align-items: center; justify-content: center;
          border-radius: 50%;
          background: rgba(255,255,255,0.85);
          -webkit-backdrop-filter: blur(4px);
          backdrop-filter: blur(4px);
          border: 1px solid rgba(0,0,0,0.08);
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
          color: rgba(0,0,0,0.55);
          cursor: pointer;
          transition: color 150ms, background 150ms, box-shadow 150ms;
        }
        .sub-carousel-arrow:hover {
          color: rgb(0,0,0);
          background: rgb(255,255,255);
          box-shadow: 0 12px 32px rgba(0,0,0,0.16);
        }
        .sub-carousel-arrow-left { left: max(24px, calc(50vw - 720px)); }
        .sub-carousel-arrow-right { right: max(24px, calc(50vw - 720px)); }

        @media (min-width: 1024px) {
          .sub-carousel-arrow { display: flex; }
        }

        @media (max-width: 768px) {
          .sub-carousel-track { padding-left: 12px; }
          .sub-card { width: 192px; height: 269px; }
        }
      `}</style>

      <div className="sub-carousel-outer" ref={outerRef}>
        <button
          type="button"
          className="sub-carousel-arrow sub-carousel-arrow-left"
          onClick={() => jumpRef.current(-1)}
          aria-label="Derulează spre stânga"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <div className="sub-carousel-track" ref={trackRef}>
          {doubled.map((s, i) => (
            <Link
              key={`${s.id}-${i}`}
              href={
                s.category_name
                  ? `/produse?categorie=${encodeURIComponent(s.category_name)}&subcategorie=${encodeURIComponent(s.name)}`
                  : `/produse?subcategorie=${encodeURIComponent(s.name)}`
              }
              className="sub-card"
            >
              {s.image_url && (
                <img src={s.image_url} alt={s.name} className="sub-card-img" loading="lazy" />
              )}
              <div className="sub-card-overlay" />
              <div className="sub-card-bottom">
                <span className="sub-card-count">{s.product_count.toLocaleString('ro')} produse</span>
                <span className="sub-card-label">{s.name}</span>
              </div>
            </Link>
          ))}
        </div>

        <button
          type="button"
          className="sub-carousel-arrow sub-carousel-arrow-right"
          onClick={() => jumpRef.current(1)}
          aria-label="Derulează spre dreapta"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </>
  )
}
