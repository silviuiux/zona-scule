'use client'
import { useEffect } from 'react'
import Lenis from 'lenis'

/**
 * Site-wide momentum (inertia) smooth scrolling powered by Lenis.
 *
 * Mounted once in the root layout so it applies to every page. Lenis drives the
 * native window scroll position, so window.scrollY still updates and native
 * 'scroll' events keep firing — meaning the existing <DotsParallax /> parallax
 * layers continue to work unchanged.
 *
 * Respects prefers-reduced-motion: users who request reduced motion get the
 * default native scroll with no eased animation.
 */
export default function SmoothScroll() {
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    const lenis = new Lenis({
      // Longer duration = the page keeps gliding noticeably after you stop
      // scrolling — this is the main lever for how "visible" the smoothing feels.
      duration: 2.2,
      // Soft, long-tailed deceleration (easeOutQuart) reads as more fluid than
      // the previous sharp expo curve, which snapped to rest quickly.
      easing: (t: number) => 1 - Math.pow(1 - t, 4),
      smoothWheel: true,
      // Slightly below 1 so the longer duration doesn't feel like it's racing
      // ahead of fast wheel flicks.
      wheelMultiplier: 0.9,
      touchMultiplier: 1.5,
    })

    let raf = 0
    const loop = (time: number) => {
      lenis.raf(time)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
    }
  }, [])

  return null
}
