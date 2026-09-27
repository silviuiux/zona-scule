'use client'
import { useEffect, useRef, useState } from 'react'

// Ticks a number up from 0 like an instrument reading settling. Server
// render shows the final value (correct without JS / for crawlers); the
// first animation frame drops it to ~0 while the hero stat band is still
// faded out (see .hero-stats' entrance delay in page.tsx), so the reset
// is never visible.
export default function CountUp({
  value,
  duration = 1600,
  delay = 600,
  suffix = '',
}: {
  value: number
  duration?: number
  delay?: number
  suffix?: string
}) {
  const [shown, setShown] = useState(value)
  const raf = useRef(0)

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t))
    const timer = window.setTimeout(() => {
      const start = performance.now()
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration)
        setShown(Math.round(value * easeOutExpo(t)))
        if (t < 1) raf.current = requestAnimationFrame(tick)
      }
      raf.current = requestAnimationFrame(tick)
    }, delay)
    return () => {
      window.clearTimeout(timer)
      cancelAnimationFrame(raf.current)
    }
  }, [value, duration, delay])

  // Reserve the final value's width up front (exact in a monospace font) so
  // the number growing from 1 to 5+ digits doesn't shove its neighbours.
  const finalText = value.toLocaleString('ro-RO') + suffix
  return (
    <span style={{ display: 'inline-block', minWidth: `${finalText.length}ch` }}>
      {shown.toLocaleString('ro-RO')}{suffix}
    </span>
  )
}
