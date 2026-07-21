'use client'
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import Link from 'next/link'

type ServiceItem = {
  bg: string
  color: string
  title: string
  body: string
  cta: string
  ctaColor: string
  href: string
  icon: ReactNode
}

// Same continuous scroll-driven stagger technique as CategoryGrid's
// COL_OFFSETS, but mirrored: left card starts nearly in place (first to
// settle), center a bit deeper, right deepest — they all rise to a flush
// row once the section scrolls into view.
//
// `.services-grid` clips overflow (see page.tsx), so an unsettled card is
// cropped to the grid's own box rather than bleeding into the carousel
// section below — same safety net as CategoryGrid's rows, which is what
// lets the settle window below be long enough to actually be visible.
const OFFSETS = [0, 220, 420]
const ROW_SETTLE_RANGE = 2.2

// easeInOutCubic — same curve used for the category grid stagger.
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

export default function ServicesGrid({ items }: { items: ServiceItem[] }) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const isMobile = window.matchMedia?.('(max-width: 768px)').matches
    const root = rootRef.current
    if (!root) return

    const cards = Array.from(root.querySelectorAll<HTMLElement>('.service-card'))
    if (cards.length === 0) return

    if (reduce || isMobile) {
      // No scroll-stagger here, so reveal the icons immediately too —
      // otherwise they'd stay permanently un-drawn (see .revealed below).
      cards.forEach(el => {
        el.style.setProperty('--svc-offset', '0px')
        el.classList.add('revealed')
      })
      return
    }

    let raf = 0
    const update = () => {
      raf = 0
      const rect = root.getBoundingClientRect()
      const viewH = window.innerHeight
      const scrolledPast = viewH - rect.top
      const totalRange = Math.max(rect.height * ROW_SETTLE_RANGE, 1)
      const linear = Math.max(0, Math.min(1, scrolledPast / totalRange))
      const progress = easeInOut(linear)
      cards.forEach((el, i) => {
        const base = OFFSETS[i] ?? 0
        el.style.setProperty('--svc-offset', `${base * (1 - progress)}px`)
        // Draw the icon in once the card is most of the way settled —
        // ties the "drawn" micro-interaction to the same scroll-in the
        // card itself already animates on, instead of a separate trigger.
        el.classList.toggle('revealed', progress > 0.6)
      })
    }
    const onScroll = () => { if (raf) return; raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div className="services-grid" ref={rootRef}>
      {items.map((s, i) => {
        const initialStyle = ({
          ['--svc-offset' as string]: `${OFFSETS[i] ?? 0}px`,
        } as CSSProperties)

        return (
          <Link key={i} href={s.href} style={{ textDecoration: 'none' }}>
            {/* "revealed" starts present in SSR markup so the icon is fully
                drawn if JS is slow/disabled; the effect above removes it on
                mount and re-adds it once the card scrolls into place, which
                is what actually plays the draw-in animation. */}
            <div className="service-card revealed noise-card" style={{ ...initialStyle, background: s.bg }}>
              <div className="service-icon" style={{ color: s.color }}>{s.icon}</div>
              <h3 className="service-title" style={{ color: s.color }}>{s.title}</h3>
              <p className="service-desc" style={{ color: s.color === 'rgb(30,30,30)' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.75)' }}>{s.body}</p>
              <span className="service-cta" style={{ color: s.ctaColor }}>
                <span>{s.cta}</span>
                <span className="service-cta-arrow">→</span>
              </span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
