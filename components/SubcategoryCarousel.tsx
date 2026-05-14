'use client'
import Link from 'next/link'
import { useRef, useEffect } from 'react'
import type { FeaturedSubcategoryWithImage } from '@/lib/supabase'

export default function SubcategoryCarousel({ subs }: { subs: FeaturedSubcategoryWithImage[] }) {
  const doubled = [...subs, ...subs]
  const trackRef = useRef<HTMLDivElement>(null)
  const hasDragged = useRef(false)

  useEffect(() => {
    const track = trackRef.current
    if (!track || subs.length === 0) return

    const SPEED = 0.7  // px per rAF tick ≈ 42 px/s @ 60 fps
    let x = 0
    let isDragging = false
    let startClientX = 0
    let startX = 0
    let raf: number

    const cardW = () => window.innerWidth <= 768 ? 192 + 12 : 284 + 12
    const totalW = () => subs.length * cardW()

    const tick = () => {
      if (!isDragging) {
        x -= SPEED
        const tw = totalW()
        if (x <= -tw) x += tw
      }
      track.style.transform = `translateX(${x}px)`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    // ── Mouse drag ──────────────────────────────────────────────────────────
    const onMouseDown = (e: MouseEvent) => {
      isDragging = true
      hasDragged.current = false
      startClientX = e.clientX
      startX = x
      track.style.cursor = 'grabbing'
    }
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      const delta = e.clientX - startClientX
      if (Math.abs(delta) > 4) hasDragged.current = true
      const tw = totalW()
      x = startX + delta
      if (x < -tw * 1.5) x += tw
      if (x > tw * 0.5) x -= tw
    }
    const onMouseUp = () => {
      isDragging = false
      track.style.cursor = 'grab'
    }

    // ── Touch drag ───────────────────────────────────────────────────────────
    const onTouchStart = (e: TouchEvent) => {
      isDragging = true
      hasDragged.current = false
      startClientX = e.touches[0].clientX
      startX = x
    }
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging) return
      const delta = e.touches[0].clientX - startClientX
      if (Math.abs(delta) > 4) hasDragged.current = true
      const tw = totalW()
      x = startX + delta
      if (x < -tw * 1.5) x += tw
      if (x > tw * 0.5) x -= tw
    }
    const onTouchEnd = () => { isDragging = false }

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

    return () => {
      cancelAnimationFrame(raf)
      track.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      track.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      track.removeEventListener('click', onClickCapture, true)
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
          background: rgb(40,40,40);
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

        @media (max-width: 768px) {
          .sub-carousel-track { padding-left: 32px; }
          .sub-card { width: 192px; height: 269px; }
        }
      `}</style>

      <div className="sub-carousel-outer">
        <div className="sub-carousel-track" ref={trackRef}>
          {doubled.map((s, i) => (
            <Link
              key={`${s.id}-${i}`}
              href={`/produse?subcategorie=${encodeURIComponent(s.name)}`}
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
      </div>
    </>
  )
}
