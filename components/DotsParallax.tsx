'use client'
import { useEffect } from 'react'

/**
 * Updates CSS variables on :root every scroll for the page's parallax layers:
 *
 *   --dot-y         : background-position offset for body::before dot pattern.
 *                     Dots move at 80% of scroll speed (slower than foreground
 *                     → depth illusion). At scrollY=100, dots shift up 80px.
 *
 *   --hero-y        : transform offset for .hero-inner content (homepage).
 *                     Hero races at 120% of scroll speed (faster than fg →
 *                     foreground pop). At scrollY=100, content shifts up an
 *                     extra 20px on top of natural scroll → 120% effective.
 *
 *   --cat-banner-y  : transform offset for .cat-hero-img on /produse.
 *                     Banner moves at 40% of scroll speed (much slower than
 *                     foreground → background depth). At scrollY=100, the
 *                     image translates DOWN 60px so it appears to scroll up
 *                     only 40px → 40% effective.
 *
 * Also drifts the dot layer toward the cursor across the whole viewport:
 *
 *   --dot-tx/--dot-ty : subtle translate toward the pointer (± a few px).
 *   --dot-scale       : subtle scale-up as the pointer moves off-center, read
 *                        as the dot plane drifting closer on the z-axis.
 *
 * Both are eased toward their target every frame (lerp, not snapped) so the
 * motion settles like a slow-drifting plane rather than tracking the cursor
 * directly — the "organic" part of the effect. The easing loop only runs
 * while the values are still moving; it stops once they settle and restarts
 * on the next pointer movement.
 */
export default function DotsParallax() {
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    const root = document.documentElement
    let raf = 0
    const update = () => {
      raf = 0
      const y = window.scrollY
      root.style.setProperty('--dot-y', `${-y * 0.8}px`)
      root.style.setProperty('--hero-y', `${-y * 0.2}px`)
      root.style.setProperty('--cat-banner-y', `${y * 0.6}px`)
      // Noise layer moves at 90% of scroll speed: shift background-position
      // by -10% of scrollY so the absolute element's net speed = 90%.
      root.style.setProperty('--noise-y', `${-y * 0.1}px`)
    }
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })

    if (reduce) {
      return () => {
        window.removeEventListener('scroll', onScroll)
        if (raf) cancelAnimationFrame(raf)
      }
    }

    // Pointer-driven drift for the dot layer, in normalized 0..1 viewport
    // coordinates, resting at the center (0.5, 0.5) when idle.
    const DOT_TX_RANGE = 6 // px, at full ±1 offset from center
    const DOT_TY_RANGE = 6 // px
    const DOT_SCALE_RANGE = 0.015 // added scale at full offset
    const EASE = 0.04
    const EPSILON = 0.0004

    let targetX = 0.5
    let targetY = 0.5
    let curX = 0.5
    let curY = 0.5
    let hoverRaf = 0

    const tick = () => {
      curX += (targetX - curX) * EASE
      curY += (targetY - curY) * EASE
      const nx = (curX - 0.5) * 2 // -1..1
      const ny = (curY - 0.5) * 2
      root.style.setProperty('--dot-tx', `${(nx * DOT_TX_RANGE).toFixed(2)}px`)
      root.style.setProperty('--dot-ty', `${(ny * DOT_TY_RANGE).toFixed(2)}px`)
      root.style.setProperty('--dot-scale', `${(1 + (Math.abs(nx) + Math.abs(ny)) * 0.5 * DOT_SCALE_RANGE).toFixed(4)}`)

      if (Math.abs(targetX - curX) < EPSILON && Math.abs(targetY - curY) < EPSILON) {
        hoverRaf = 0
        return
      }
      hoverRaf = requestAnimationFrame(tick)
    }
    const kick = () => {
      if (!hoverRaf) hoverRaf = requestAnimationFrame(tick)
    }
    const onMouseMove = (e: MouseEvent) => {
      targetX = e.clientX / window.innerWidth
      targetY = e.clientY / window.innerHeight
      kick()
    }
    const onMouseLeave = () => {
      targetX = 0.5
      targetY = 0.5
      kick()
    }
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('mouseleave', onMouseLeave)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseleave', onMouseLeave)
      if (raf) cancelAnimationFrame(raf)
      if (hoverRaf) cancelAnimationFrame(hoverRaf)
    }
  }, [])
  return null
}
