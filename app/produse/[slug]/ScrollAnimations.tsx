'use client'
import { useEffect } from 'react'

/**
 * Mounts scroll-driven animation behaviours on the PDP.
 *
 * 1. IntersectionObserver  — adds `.in-view` to every `.reveal` and
 *    `.reveal-scale` element, triggering the CSS transitions defined in
 *    the page's <style> block.
 *
 * 2. Stagger offsets        — sets `--reveal-delay` on `.spec-card` and
 *    `.info-card` children so they cascade in sequence.
 *
 * 3. Hero-image parallax    — scrolls the right-column image at ~0.18× speed
 *    so it drifts slower than the page, creating foreground / background depth.
 *    The column wrapper has `overflow:hidden` so nothing bleeds out.
 *
 * All animations use only `opacity` + `transform` (compositor-thread only).
 */
export default function ScrollAnimations() {
  useEffect(() => {
    // ── 1. Stagger delays ──────────────────────────────────────────────────
    const stagger = (selector: string, base = 0, step = 90) => {
      document.querySelectorAll<HTMLElement>(selector).forEach((el, i) => {
        el.style.transitionDelay = `${base + i * step}ms`
      })
    }
    stagger('.spec-card', 0, 100)
    stagger('.pdp-char-section .info-card', 0, 80)
    stagger('.pdp-app-section .info-card', 0, 80)

    // ── 2. IntersectionObserver ────────────────────────────────────────────
    const obs = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('in-view')
            obs.unobserve(e.target)
          }
        }
      },
      {
        threshold: 0.06,
        rootMargin: '0px 0px -24px 0px',
      }
    )
    document.querySelectorAll('.reveal, .reveal-scale').forEach(el => obs.observe(el))

    // ── 3. Hero-image column parallax ──────────────────────────────────────
    const imgCol = document.querySelector<HTMLElement>('.pdp-img-col')
    let rafId = 0

    const onScroll = () => {
      if (!imgCol) return
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        const y = window.scrollY
        // Positive translateY → image drifts downward as page scrolls up → parallax depth
        imgCol.style.transform = `translateY(${Math.round(y * 0.14)}px)`
      })
    }

    if (imgCol) {
      window.addEventListener('scroll', onScroll, { passive: true })
    }

    return () => {
      obs.disconnect()
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return null
}
