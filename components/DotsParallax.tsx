'use client'
import { useEffect } from 'react'

/**
 * Sets a CSS variable `--dot-y` on :root that the body::before dot pattern
 * reads from background-position. Dots move at 80% of scroll speed, so when
 * the page scrolls 100px the dots appear to move 80px — a subtle parallax.
 *
 * Implementation: body::before is position:fixed, so by default dots don't
 * move at all (0% speed). We shift its background-position by -scrollY * 0.8,
 * which makes the pattern appear to scroll at 80% of foreground speed.
 */
export default function DotsParallax() {
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    const root = document.documentElement
    let raf = 0
    const update = () => {
      raf = 0
      root.style.setProperty('--dot-y', `${-window.scrollY * 0.8}px`)
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
