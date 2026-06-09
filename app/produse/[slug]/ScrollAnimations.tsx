'use client'
import { useEffect } from 'react'

/**
 * Scroll-driven behaviours on the PDP: stagger delays, in-view reveals,
 * hero image parallax. Skipped entirely for prefers-reduced-motion users
 * (CSS already shows everything for them).
 */
export default function ScrollAnimations() {
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      document.querySelectorAll('.reveal, .reveal-scale').forEach(el => el.classList.add('in-view'))
      return
    }

    const stagger = (selector: string, base = 0, step = 90) => {
      document.querySelectorAll<HTMLElement>(selector).forEach((el, i) => {
        el.style.transitionDelay = `${base + i * step}ms`
      })
    }
    stagger('.spec-card', 0, 100)
    stagger('.pdp-char-section .info-card', 0, 80)
    stagger('.pdp-app-section .info-card', 0, 80)

    const obs = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('in-view')
            obs.unobserve(e.target)
          }
        }
      },
      { threshold: 0.06, rootMargin: '0px 0px -24px 0px' }
    )
    document.querySelectorAll('.reveal, .reveal-scale').forEach(el => obs.observe(el))

    const imgCol = document.querySelector<HTMLElement>('.pdp-img-col')
    let rafId = 0
    const onScroll = () => {
      if (!imgCol) return
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        const y = window.scrollY
        imgCol.style.transform = `translateY(${Math.round(y * 0.14)}px)`
      })
    }
    if (imgCol) window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      obs.disconnect()
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return null
}
