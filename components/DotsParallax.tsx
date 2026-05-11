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
 */
export default function DotsParallax() {
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    const root = document.documentElement
    let raf = 0
    const update = () => {
      raf = 0
      const y = window.scrollY
      root.style.setProperty('--dot-y', `${-y * 0.8}px`)
      root.style.setProperty('--hero-y', `${-y * 0.2}px`)
      root.style.setProperty('--cat-banner-y', `${y * 0.6}px`)
    }
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])
  return null
}
