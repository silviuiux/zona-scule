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
 *   [data-expand]  the first photo, pinned while it grows to the whole
 *                  screen: --p 0 → 1 across its scroll length.
 *   [data-open]    a full-bleed photo opening from a framed picture as it
 *                  comes in: --o 0 → 1 from entering to filling the screen.
 *   --read         reading progress 0 → 1 on <html>, drawn inside the nav
 *                  bar by <Nav progress />.
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
    const expands = Array.from(document.querySelectorAll<HTMLElement>('[data-expand]'))
    const opens = Array.from(document.querySelectorAll<HTMLElement>('[data-open]'))
    const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
    let raf = 0
    const frame = () => {
      raf = 0
      const vh = window.innerHeight
      const max = document.documentElement.scrollHeight - vh
      root.style.setProperty('--read', max > 0 ? clamp01(window.scrollY / max).toFixed(4) : '0')
      for (const el of expands) {
        const r = el.getBoundingClientRect()
        // grows over the first ~60% of the pinned stretch, then holds
        const p = clamp01(-r.top / ((r.height - vh) * 0.6))
        el.style.setProperty('--p', (1 - (1 - p) ** 2).toFixed(4))
      }
      for (const el of opens) {
        const r = el.getBoundingClientRect()
        if (r.bottom < 0 || r.top > vh) continue
        const o = clamp01((vh - r.top) / (vh * 0.85))
        el.style.setProperty('--o', (1 - (1 - o) ** 2).toFixed(4))
      }
      for (const el of layers) {
        const r = el.getBoundingClientRect()
        if (r.bottom < 0 || r.top > vh) continue
        const t = (r.top + r.height / 2 - vh / 2) / vh // -1…1 around the middle
        const inner = el.firstElementChild as HTMLElement | null
        if (inner) inner.style.transform = `translate3d(0, ${(t * -6).toFixed(2)}%, 0) scale(1.12)`
      }
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(frame) }
    if (!reduce) {
      frame()
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
      root.style.removeProperty('--read')
    }
  }, [])
  return null
}
