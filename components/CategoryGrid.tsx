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

// Per-column starting vertical offset (px) for the scroll-stagger animation.
// A clean staircase that DECREASES left→right: col0 starts deepest (only its
// top edge peeks), col1 shows more, col2 (the wide card) shows most. All
// columns rise together to a flush grid as you scroll.
const COL_OFFSETS = [420, 280, 140, 0]
const GRID_COLS = 4
// The columns finish lining up only once the LAST row of cards has scrolled
// into view, so the alignment is spread across the grid's full scroll span.
// This fraction of the viewport is shaved off the end so the line-up settles
// while the last row is comfortably visible rather than at the very bottom.
const ALIGN_END_BIAS = 0.15

// easeInOutCubic — accelerate into the line-up, settle gently out of it.
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

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
      // Drive progress off the grid's own viewport position, not raw scrollY.
      // This makes alignment viewport-size agnostic and ties it to when
      // the grid rows are actually visible.
      const rect = root.getBoundingClientRect()
      const viewH = window.innerHeight
      // "scrolledPast" = how far the grid top has travelled above the bottom
      // of the viewport (0 = grid top just entering at viewport bottom).
      const scrolledPast = viewH - rect.top
      // Run progress across the grid's ENTIRE height: 0 when the grid top
      // reaches the viewport bottom, 1 only once the grid bottom (the last
      // row) is comfortably in view. This makes the line-up long and ties its
      // completion to the last row appearing — instead of a fixed row count.
      const totalRange = Math.max(rect.height - viewH * ALIGN_END_BIAS, 1)
      const linear = Math.max(0, Math.min(1, scrolledPast / totalRange))
      const progress = easeInOut(linear)
      allCards.forEach(el => {
        const col = Number(el.dataset.col ?? 0)
        const base = COL_OFFSETS[col] ?? 0
        // Single shared progress — every column rises in lockstep, keeping the
        // staircase rigid as it eases up to a flush grid.
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
