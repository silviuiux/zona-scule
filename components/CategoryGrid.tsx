'use client'
import { useEffect, useRef, type CSSProperties } from 'react'
import Link from 'next/link'

type Cat = {
  id: string
  name: string
  hero_image_url: string | null
  description: string | null
  product_count: number
}

// Per-column vertical offset (px). Applied to EVERY row identically so the
// 16px row gap is preserved — cards in the same column move together.
// Reversed so column 0 sits lowest ("barely visible") and column 3 stays put.
const COL_OFFSETS = [270, 180, 90, 0]
// Scroll distance (px) over which the cards converge from staggered → aligned.
const FALL_DISTANCE = 520

export default function CategoryGrid({ categories }: { categories: Cat[] }) {
  const rootRef = useRef<HTMLDivElement>(null)

  // ── Effect 1: scroll-driven stagger (existing) ──
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const isMobile = window.matchMedia?.('(max-width: 768px)').matches
    const root = rootRef.current
    if (!root) return

    const allCards = Array.from(root.querySelectorAll<HTMLElement>('.cat-card'))
    if (allCards.length === 0) return

    // On reduced-motion / mobile, snap to aligned (no stagger).
    if (reduce || isMobile) {
      allCards.forEach(el => el.style.setProperty('--cat-offset', '0px'))
      return
    }

    let raf = 0
    const update = () => {
      raf = 0
      // Progress is driven directly by scrollY: as soon as the user scrolls,
      // the cards begin converging. By scrollY === FALL_DISTANCE they are aligned.
      const progress = Math.max(0, Math.min(1, window.scrollY / FALL_DISTANCE))
      allCards.forEach(el => {
        const col = Number(el.dataset.col ?? 0)
        const base = COL_OFFSETS[col] ?? 0
        el.style.setProperty('--cat-offset', `${base * (1 - progress)}px`)
      })
    }
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  // ── Effect 2: in-view reveal (fade + translate up) ──
  // Adds `.in-view` to each card to trigger the CSS transition on opacity
  // and `translate`. The first row fires on page load after a 600ms delay;
  // subsequent rows fire when they enter the viewport via IntersectionObserver.
  // A small per-card stagger (60ms) within each row keeps the reveal feeling
  // organic instead of all-at-once.
  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const allCards = Array.from(root.querySelectorAll<HTMLElement>('.cat-card'))
    if (allCards.length === 0) return

    // Reduced motion: snap everything to revealed state, no animation.
    if (reduce) {
      allCards.forEach(el => el.classList.add('in-view'))
      return
    }

    const timeouts: number[] = []
    const reveal = (cards: HTMLElement[], baseDelay: number) => {
      cards.forEach((card, i) => {
        timeouts.push(
          window.setTimeout(() => card.classList.add('in-view'), baseDelay + i * 60)
        )
      })
    }

    const rows = Array.from(root.querySelectorAll<HTMLElement>('.cats-row'))

    // First row: fixed 600ms delay on load
    if (rows[0]) {
      const firstRowCards = Array.from(rows[0].querySelectorAll<HTMLElement>('.cat-card'))
      reveal(firstRowCards, 600)
    }

    // Other rows: intersection-triggered, one-shot
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const rowCards = Array.from(
              entry.target.querySelectorAll<HTMLElement>('.cat-card')
            )
            reveal(rowCards, 0)
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.15,             // 15% of the row in view triggers it
        rootMargin: '0px 0px -40px 0px', // fire slightly before fully entering
      }
    )
    rows.slice(1).forEach(row => observer.observe(row))

    return () => {
      observer.disconnect()
      timeouts.forEach(clearTimeout)
    }
  }, [])

  // Chunk categories into rows of 4
  const rows: Cat[][] = []
  for (let i = 0; i < categories.length; i += 4) {
    rows.push(categories.slice(i, i + 4))
  }

  return (
    <div ref={rootRef}>
      {rows.map((row, rowIdx) =>
        row.length > 0 ? (
          <div key={rowIdx} className="cats-row">
            {row.map((cat, i) => {
              // Pre-set initial offset so SSR / first paint already shows the
              // staggered state — no snap when JS hydrates.
              const initialStyle = ({
                ['--cat-offset' as string]: `${COL_OFFSETS[i] ?? 0}px`,
              } as CSSProperties)

              return (
                <Link
                  key={cat.id}
                  href={`/produse?categorie=${encodeURIComponent(cat.name)}`}
                  className="cat-card"
                  style={initialStyle}
                  data-col={i}
                >
                  <div className="cat-card-img-wrap">
                    {cat.hero_image_url ? (
                      <img
                        src={cat.hero_image_url}
                        alt={cat.name}
                        className="cat-card-img"
                        loading="lazy"
                      />
                    ) : (
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: `hsl(${(rowIdx * 90 + i * 22) % 360}, 6%, ${74 - i * 2}%)`,
                        }}
                      />
                    )}
                  </div>
                  <div className="cat-card-overlay" />
                  <div className="cat-card-bottom">
                    <span className="cat-card-count">
                      {cat.product_count > 0
                        ? cat.product_count.toLocaleString('ro')
                        : '—'}{' '}
                      produse
                    </span>
                    <span className="cat-card-label">{cat.name}</span>
                    {cat.description && (
                      <span className="cat-card-desc">{cat.description}</span>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        ) : null
      )}
    </div>
  )
}
