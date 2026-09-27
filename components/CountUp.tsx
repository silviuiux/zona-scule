'use client'
import { useEffect, useRef } from 'react'

// Ticks a number up from 0 like an instrument reading settling. Server
// render shows the final value (correct without JS / for crawlers).
//
// By default it starts `delay` ms after mount. With `onView`, it drops to 0
// right away (it's below the fold, so nobody sees the reset) and starts
// once the number is scrolled well into view.
//
// With `tickEvery` (ms), once the count-up lands it keeps going: +1 every
// tickEvery ms, each new value sliding up into place.
//
// Writes straight to the DOM instead of through state, so the ~100 frames
// of ticking don't re-render the component.
export default function CountUp({
  value,
  duration = 1600,
  delay = 600,
  suffix = '',
  onView = false,
  tickEvery,
}: {
  value: number
  duration?: number
  delay?: number
  suffix?: string
  onView?: boolean
  tickEvery?: number
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
    let interval = 0
    const startTicking = () => {
      if (!tickEvery) return
      let current = value
      interval = window.setInterval(() => {
        current += 1
        el.textContent = format(current)
        el.animate(
          [{ transform: 'translateY(35%)', opacity: 0 }, { transform: 'none', opacity: 1 }],
          { duration: 450, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
        )
      }, tickEvery)
    }
    const run = () => {
      const start = performance.now()
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration)
        el.textContent = format(Math.round(value * easeOutExpo(t)))
        if (t < 1) raf = requestAnimationFrame(tick)
        else startTicking()
      }
      raf = requestAnimationFrame(tick)
    }
    const cleanup = () => { window.clearTimeout(timer); window.clearInterval(interval); cancelAnimationFrame(raf) }

    if (!onView) {
      timer = window.setTimeout(run, delay)
      return cleanup
    }

    el.textContent = format(0)
    const io = new IntersectionObserver(entries => {
      if (!entries.some(e => e.isIntersecting)) return
      io.disconnect()
      timer = window.setTimeout(run, delay)
    }, { threshold: 1, rootMargin: '0px 0px -15% 0px' })
    io.observe(el)
    return () => { io.disconnect(); cleanup() }
  }, [value, duration, delay, suffix, onView, tickEvery])

  // Reserve the final value's width up front (exact in a monospace font) so
  // the number growing from 1 to 5+ digits doesn't shove its neighbours.
  const finalText = value.toLocaleString('ro-RO') + suffix
  return (
    <span ref={ref} style={{ display: 'inline-block', minWidth: `${finalText.length}ch` }}>
      {finalText}
    </span>
  )
}
