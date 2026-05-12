'use client'
import { useEffect, useRef, type CSSProperties } from 'react'
import Link from 'next/link'

type Cat = {
  id: string
  name: string
  hero_image_url: string | null
  description: string | null
  product_count: number
  featured: boolean
}

// Per-column vertical offset for the scroll-stagger animation.
// Col 0 = most staggered, col 3 = flush.
const COL_OFFSETS = [270, 180, 90, 0]
const FALL_DISTANCE = 520
const GRID_COLS = 4

// ── Greedy row builder ────────────────────────────────────────────────────────
// Places categories left-to-right in a GRID_COLS-column grid.
// featured categories span 2 columns; regular ones span 1.
// Returns rows where each entry carries the cat + its starting column position.
type Slot = { cat: Cat; colStart: number }

function buildRows(cats: Cat[]): Slot[][] {
  const rows: Slot[][] = []
  let row: Slot[] = []
  let used = 0

  for (const cat of cats) {
    const span = cat.featured ? 2 : 1
    if (used + span > GRID_COLS) {
      // Current row is full (or can't fit this card) — start a new one
      if (row.length) rows.push(row)
      row = []
      used = 0
    }
    row.push({ cat, colStart: used })
    used += span
    if (used === GRID_COLS) {
      rows.push(row)
      row = []
      used = 0
    }
  }
  if (row.length) rows.push(row)
  return rows
}
// ─────────────────────────────────────────────────────────────────────────────

export default function CategoryGrid({ categories }: { categories: Cat[] }) {
  const rootRef = useRef<HTMLDivElement>(null)

  // ── Effect 1: scroll-driven column stagger ──
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const isMobile = window.matchMedia?.('(max-width: 768px)').matches
    const root = rootRef.current
    if (!root) return

    const allCards = Array.from(root.querySelectorAll<HTMLElement>('.cat-card'))
    if (allCards.length === 0) return

    if (reduce || isMobile) {
      allCards.forEach(el => el.style.setProperty('--cat-offset', '0px'))
      return
    }

    let raf = 0
    const update = () => {
      raf = 0
      const progress = Math.max(0, Math.min(1, window.scrollY / FALL_DISTANCE))
      allCards.forEach(el => {
        const col = Number(el.dataset.col ?? 0)
        const base = COL_OFFSETS[col] ?? 0
        el.style.setProperty('--cat-offset', `${base * (1 - progress)}px`)
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

  // ── Effect 2: in-view fade + translate reveal ──
  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const allCards = Array.from(root.querySelectorAll<HTMLElement>('.cat-card'))
    if (allCards.length === 0) return

    if (reduce) { allCards.forEach(el => el.classList.add('in-view')); return }

    const timeouts: number[] = []
    const reveal = (cards: HTMLElement[], baseDelay: number) =>
      cards.forEach((card, i) =>
        timeouts.push(window.setTimeout(() => card.classList.add('in-view'), baseDelay + i * 60))
      )

    const rowEls = Array.from(root.querySelectorAll<HTMLElement>('.cats-row'))
    if (rowEls[0]) reveal(Array.from(rowEls[0].querySelectorAll<HTMLElement>('.cat-card')), 600)

    const observer = new IntersectionObserver(
      entries => entries.forEach(entry => {
        if (!entry.isIntersecting) return
        reveal(Array.from(entry.target.querySelectorAll<HTMLElement>('.cat-card')), 0)
        observer.unobserve(entry.target)
      }),
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    )
    rowEls.slice(1).forEach(row => observer.observe(row))
    return () => { observer.disconnect(); timeouts.forEach(clearTimeout) }
  }, [])

  const rows = buildRows(categories)

  return (
    <div ref={rootRef}>
      {rows.map((row, rowIdx) => (
        <div key={rowIdx} className="cats-row">
          {row.map(({ cat, colStart }) => {
            const isWide = cat.featured
            const initialStyle = ({
              ['--cat-offset' as string]: `${COL_OFFSETS[colStart] ?? 0}px`,
              ...(isWide ? { gridColumn: 'span 2' } : {}),
            } as CSSProperties)

            return (
              <Link
                key={cat.id}
                href={`/produse?categorie=${encodeURIComponent(cat.name)}`}
                className="cat-card"
                style={initialStyle}
                data-col={colStart}
              >
                <div className="cat-card-img-wrap">
                  {cat.hero_image_url ? (
                    <img src={cat.hero_image_url} alt={cat.name} className="cat-card-img" loading="lazy" />
                  ) : (
                    <div style={{ position: 'absolute', inset: 0, background: `hsl(${(rowIdx * 90 + colStart * 22) % 360}, 6%, 74%)` }} />
                  )}
                </div>
                <div className="cat-card-overlay" />
                <div className="cat-card-bottom">
                  <span className="cat-card-count">
                    {cat.product_count > 0 ? cat.product_count.toLocaleString('ro') : '—'} produse
                  </span>
                  <span className="cat-card-label">{cat.name}</span>
                  {cat.description && <span className="cat-card-desc">{cat.description}</span>}
                </div>
              </Link>
            )
          })}
        </div>
      ))}
    </div>
  )
}
