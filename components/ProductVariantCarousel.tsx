'use client'
import { useRef, useEffect } from 'react'
import ProductCard from './ProductCard'
import type { Product } from '@/lib/supabase'

/**
 * PDP-only carousel listing every variant in a product family (same ProductCard
 * used on /produse listing pages, so cards look identical everywhere). Unlike
 * SubcategoryCarousel — which renders large image tiles on their own section
 * background — this carousel is intentionally transparent: it sits directly on
 * the page's existing gray background (rgb(244,244,244)), no wrapper section.
 *
 * Drag + auto-scroll behavior is copied from SubcategoryCarousel (infinite
 * loop via a doubled track, rAF-driven drift, mouse/touch drag that suppresses
 * the following click on real drags) — kept as a near-duplicate rather than a
 * shared abstraction since the two differ in card size/shape and this one
 * needs to stop auto-scrolling on hover (dozens of narrow cards read worse
 * when constantly drifting under the cursor while someone's trying to browse).
 */
export default function ProductVariantCarousel({
  variants,
  title = 'Alte variante disponibile',
}: {
  variants: Product[]
  title?: string
}) {
  const doubled = [...variants, ...variants]
  const trackRef = useRef<HTMLDivElement>(null)
  const hasDragged = useRef(false)

  useEffect(() => {
    const track = trackRef.current
    if (!track || variants.length === 0) return

    const SPEED = 0.5
    let x = 0
    let isDragging = false
    let isHovering = false
    let startClientX = 0
    let startX = 0
    let raf: number

    const cardW = () => (window.innerWidth <= 768 ? 200 + 12 : 300 + 16)
    const totalW = () => variants.length * cardW()

    const tick = () => {
      if (!isDragging && !isHovering) {
        x -= SPEED
        const tw = totalW()
        if (x <= -tw) x += tw
      }
      track.style.transform = `translateX(${x}px)`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    const onMouseEnter = () => { isHovering = true }
    const onMouseLeave = () => { isHovering = false }

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

    const onClickCapture = (e: MouseEvent) => {
      if (hasDragged.current) { e.preventDefault(); e.stopPropagation() }
    }

    track.addEventListener('mouseenter', onMouseEnter)
    track.addEventListener('mouseleave', onMouseLeave)
    track.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    track.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd)
    track.addEventListener('click', onClickCapture, true)

    return () => {
      cancelAnimationFrame(raf)
      track.removeEventListener('mouseenter', onMouseEnter)
      track.removeEventListener('mouseleave', onMouseLeave)
      track.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      track.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      track.removeEventListener('click', onClickCapture, true)
    }
  }, [variants.length])

  if (variants.length <= 4) return null

  return (
    <>
      <style>{`
        .variant-carousel-section {
          /* No background — deliberately transparent, sits on the PDP's
             existing rgb(244,244,244) page background. */
          padding: 96px 0;
        }
        .variant-carousel-label {
          max-width: 1440px; margin: 0 auto 24px;
          padding: 0 12px;
          font-family: 'Inter', sans-serif;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: rgba(0,0,0,0.35);
        }

        .variant-carousel-outer {
          position: relative;
          left: 50%;
          transform: translateX(-50%);
          width: 100vw;
          overflow: hidden;
        }

        .variant-carousel-track {
          display: flex;
          padding-left: max(32px, calc(50vw - 720px + 24px));
          will-change: transform;
          cursor: grab;
          user-select: none;
          -webkit-user-select: none;
        }
        .variant-carousel-track:active { cursor: grabbing; }

        .variant-card-slot {
          flex-shrink: 0;
          width: 300px;
          margin-right: 16px;
        }

        @media (max-width: 768px) {
          .variant-carousel-section { padding: 48px 0; }
          .variant-carousel-track { padding-left: 12px; }
          .variant-card-slot { width: 200px; margin-right: 12px; }
        }
      `}</style>

      <div className="variant-carousel-section reveal">
        <p className="variant-carousel-label">{title} ({variants.length})</p>
        <div className="variant-carousel-outer">
          <div className="variant-carousel-track" ref={trackRef}>
            {doubled.map((p, i) => (
              <div className="variant-card-slot" key={`${p.id}-${i}`}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
