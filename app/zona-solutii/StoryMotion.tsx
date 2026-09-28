'use client'
import { useEffect } from 'react'

/**
 * Scroll choreography for the Zona Soluții stories. Server-rendered content
 * stays fully visible until this runs — it only hides what it will reveal
 * once it has taken over (html.zs-motion), so crawlers and no-JS readers see
 * everything.
 *
 *   [data-reveal]  fades / rises in once, as it enters the viewport; a
 *                  --i index on it staggers siblings.
 *   [data-step]    one step of a sequence (inside [data-steps]): the step
 *                  crossing the middle of the screen is the active one, the
 *                  rest recede; the sequence's counter shows its number.
 *   [data-parallax] a full-bleed image that drifts slightly against the
 *                  scroll.
 */
export default function StoryMotion() {
  useEffect(() => {
    const root = document.documentElement
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    root.classList.add('zs-motion')

    const reveals = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
    const revealIO = new IntersectionObserver(entries => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); revealIO.unobserve(e.target) }
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 })
    if (reduce) reveals.forEach(el => el.classList.add('is-in'))
    else reveals.forEach(el => revealIO.observe(el))

    const steps = Array.from(document.querySelectorAll<HTMLElement>('[data-step]'))
    const stepIO = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        const el = e.target as HTMLElement
        const group = el.closest<HTMLElement>('[data-steps]')
        group?.querySelectorAll('[data-step]').forEach(s => s.classList.toggle('is-active', s === el))
        const counter = group?.querySelector<HTMLElement>('[data-step-current]')
        if (counter) counter.textContent = el.dataset.step ?? ''
      }
    }, { rootMargin: '-45% 0px -45% 0px' })
    steps.forEach(el => stepIO.observe(el))
    // before the first step reaches the middle, the first one leads
    document.querySelectorAll('[data-steps]').forEach(g => g.querySelector('[data-step]')?.classList.add('is-active'))

    const layers = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'))
    let raf = 0
    const drift = () => {
      raf = 0
      const vh = window.innerHeight
      for (const el of layers) {
        const r = el.getBoundingClientRect()
        if (r.bottom < 0 || r.top > vh) continue
        const t = (r.top + r.height / 2 - vh / 2) / vh // -1…1 around the middle
        const inner = el.firstElementChild as HTMLElement | null
        if (inner) inner.style.transform = `translate3d(0, ${(t * -6).toFixed(2)}%, 0) scale(1.12)`
      }
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(drift) }
    if (!reduce && layers.length) {
      drift()
      window.addEventListener('scroll', onScroll, { passive: true })
      window.addEventListener('resize', onScroll)
    }

    return () => {
      revealIO.disconnect()
      stepIO.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
      root.classList.remove('zs-motion')
    }
  }, [])
  return null
}
