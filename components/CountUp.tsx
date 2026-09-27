'use client'
import { useEffect, useRef } from 'react'

// Ticks a number up from 0 like an instrument reading settling. Server
// render shows the final value (correct without JS / for crawlers).
//
// By default it starts `delay` ms after mount. With `onView`, it drops to 0
// right away (it's below the fold, so nobody sees the reset) and starts
// once the number is scrolled well into view.
//
// Writes straight to the DOM instead of through state, so the ~100 frames
// of ticking don't re-render the component.
export default function CountUp({
  value,
  duration = 1600,
  delay = 600,
  suffix = '',
  onView = false,
}: {
  value: number
  duration?: number
  delay?: number
  suffix?: string
  onView?: boolean
}) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const format = (n: number) => n.toLocaleString('ro-RO') + suffix
    const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t))
    let raf = 0
    let timer = 0
    const run = () => {
      const start = performance.now()
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration)
        el.textContent = format(Math.round(value * easeOutExpo(t)))
        if (t < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }

    if (!onView) {
      timer = window.setTimeout(run, delay)
      return () => { window.clearTimeout(timer); cancelAnimationFrame(raf) }
    }

    el.textContent = format(0)
    const io = new IntersectionObserver(entries => {
      if (!entries.some(e => e.isIntersecting)) return
      io.disconnect()
      timer = window.setTimeout(run, delay)
    }, { threshold: 1, rootMargin: '0px 0px -15% 0px' })
    io.observe(el)
    return () => { io.disconnect(); window.clearTimeout(timer); cancelAnimationFrame(raf) }
  }, [value, duration, delay, suffix, onView])

  // Reserve the final value's width up front (exact in a monospace font) so
  // the number growing from 1 to 5+ digits doesn't shove its neighbours.
  const finalText = value.toLocaleString('ro-RO') + suffix
  return (
    <span ref={ref} style={{ display: 'inline-block', minWidth: `${finalText.length}ch` }}>
      {finalText}
    </span>
  )
}
