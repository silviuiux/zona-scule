'use client'
import { useEffect, useRef, type CSSProperties } from 'react'
import Link from 'next/link'
import Image from 'next/image'

type ServiceItem = {
  bg: string
  color: string
  title: string
  body: string
  cta: string
  ctaColor: string
  href: string
  img: string
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
      cards.forEach(el => el.style.setProperty('--svc-offset', '0px'))
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
            <div className="service-card" style={initialStyle}>
              <div className="service-img">
                <Image src={s.img} alt={s.title} fill style={{ objectFit: 'cover', objectPosition: 'center top' }} sizes="(max-width: 768px) 100vw, 33vw" />
              </div>
              <div className="service-body noise-card" style={{ background: s.bg }}>
                <h3 className="service-title" style={{ color: s.color }}>{s.title}</h3>
                <p className="service-desc" style={{ color: s.color === 'rgb(30,30,30)' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.75)' }}>{s.body}</p>
                <span className="service-cta" style={{ color: s.ctaColor }}>
                  <span>{s.cta}</span>
                  <span className="service-cta-arrow">→</span>
                </span>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
