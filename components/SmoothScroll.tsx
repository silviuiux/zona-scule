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
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
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
