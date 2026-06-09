'use client'
import { useEffect } from 'react'

/**
 * Scroll-driven CSS variables for the parallax layers:
 *   --hero-y  : homepage hero content drifts at 120% scroll speed
 *   --noise-y : listing noise layer drifts at 90% scroll speed
 * (The old --dot-y / --cat-banner-y consumers were removed — dead code.)
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
      root.style.setProperty('--hero-y', `${-y * 0.2}px`)
      root.style.setProperty('--noise-y', `${-y * 0.1}px`)
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
