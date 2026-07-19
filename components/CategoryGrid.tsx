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

const GRID_COLS = 4
const CARD_HEIGHT = 400
const GAP = 16
// Permanent per-column vertical offset (px) — this IS the masonry wave, not
// a scroll effect. Decreases left→right so col0 sits lowest and col3 (or a
// wide card) sits highest, matching the staggered reference layout. Unlike
// the scroll drift below, this never resets/settles to 0 — it's baked into
// the static layout, so cards are always full-size and simply live at a
// staggered position, never clipped or masked.
const COLUMN_STAGGER = [180, 120, 60, 0]
// Small continuous scroll-driven drift on top of the static masonry
// position — capped well under GAP so a still-settling card can never reach
// into a neighbouring card, in its own column or an adjacent one.
const DRIFT_MAX = 10
const SETTLE_RANGE = 1.2

// easeInOutCubic — accelerate into the line-up, settle gently out of it.
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

type Slot = { cat: Cat; col: number; span: number; top: number }

// ── True masonry packer ─────────────────────────────────────────────────
// Places each category into whichever column is currently shortest (or the
// best pair of adjacent columns for a featured/wide card), tracking each
// column's own running height independently. Because a card's position
// comes from its column's actual packed height — not a fixed-height grid
// row — cards are free to sit anywhere in the flow, which is what lets the
// COLUMN_STAGGER wave show through with no row boundaries, no clipping, and
// (since columns never share vertical space) no risk of overlap.
function buildMasonry(cats: Cat[]): { slots: Slot[]; totalHeight: number } {
  const colHeights = new Array(GRID_COLS).fill(0)
  const slots: Slot[] = []

  for (const cat of cats) {
    const span = cat.featured ? 2 : 1
    if (span === 1) {
      let col = 0
      for (let i = 1; i < GRID_COLS; i++) if (colHeights[i] < colHeights[col]) col = i
      slots.push({ cat, col, span, top: colHeights[col] })
      colHeights[col] += CARD_HEIGHT + GAP
    } else {
      // Best adjacent pair — whichever minimises the taller of the two,
      // so the wide card sits as low as possible without leaving a gap.
      let bestCol = 0
      let bestMax = Infinity
      for (let i = 0; i <= GRID_COLS - span; i++) {
        const m = Math.max(colHeights[i], colHeights[i + 1])
        if (m < bestMax) { bestMax = m; bestCol = i }
      }
      slots.push({ cat, col: bestCol, span, top: bestMax })
      colHeights[bestCol] = colHeights[bestCol + 1] = bestMax + CARD_HEIGHT + GAP
    }
  }

  const bottoms = colHeights.map((h, c) => (h > 0 ? h - GAP + (COLUMN_STAGGER[c] ?? 0) : 0))
  const totalHeight = Math.max(CARD_HEIGHT, ...bottoms)
  return { slots, totalHeight }
}
// Column-width expression shared by left/width below — a single column's
// width once the 3 inter-column gaps are subtracted from the container.
const COL_WIDTH_EXPR = `(100% - ${(GRID_COLS - 1) * GAP}px) / ${GRID_COLS}`
// ─────────────────────────────────────────────────────────────────────────

export default function CategoryGrid({ categories }: { categories: Cat[] }) {
  const rootRef = useRef<HTMLDivElement>(null)

  // ── Effect 1: small continuous scroll drift ──
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const isMobile = window.matchMedia?.('(max-width: 768px)').matches
    const root = rootRef.current
    if (!root) return

    const cardEls = Array.from(root.querySelectorAll<HTMLElement>('.cat-card'))
    if (cardEls.length === 0) return

    if (reduce || isMobile) {
      cardEls.forEach(el => el.style.setProperty('--cat-offset', '0px'))
      return
    }

    let raf = 0
    const update = () => {
      raf = 0
      const viewH = window.innerHeight
      // Each card computes its OWN progress off its OWN viewport position.
      // The permanent masonry position (top/left/width, incl. COLUMN_STAGGER)
      // is already set via inline style below — this only adds a small,
      // capped drift on top as the card scrolls into view.
      cardEls.forEach(el => {
        const rect = el.getBoundingClientRect()
        const scrolledPast = viewH - rect.top
        const totalRange = Math.max(rect.height * SETTLE_RANGE, 1)
        const linear = Math.max(0, Math.min(1, scrolledPast / totalRange))
        const progress = easeInOut(linear)
        el.style.setProperty('--cat-offset', `${DRIFT_MAX * (1 - progress)}px`)
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

  // ── Effect 2: in-view fade + translate reveal, cascading top-to-bottom ──
  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const allCards = Array.from(root.querySelectorAll<HTMLElement>('.cat-card'))
    if (allCards.length === 0) return

    if (reduce) { allCards.forEach(el => el.classList.add('in-view')); return }

    const timeouts: number[] = []
    // Observing top-to-bottom means simultaneous entries (e.g. everything
    // already above the fold on load) cascade in that visual order too.
    const sorted = [...allCards].sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)

    const observer = new IntersectionObserver(
      entries => entries.forEach((entry, i) => {
        if (!entry.isIntersecting) return
        const el = entry.target as HTMLElement
        timeouts.push(window.setTimeout(() => el.classList.add('in-view'), i * 50))
        observer.unobserve(el)
      }),
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    )
    sorted.forEach(card => observer.observe(card))
    return () => { observer.disconnect(); timeouts.forEach(clearTimeout) }
  }, [])

  const { slots, totalHeight } = buildMasonry(categories)

  return (
    <div ref={rootRef} className="cats-masonry" style={{ height: totalHeight }}>
      {slots.map(({ cat, col, span, top }, i) => {
        const cardStyle: CSSProperties = {
          position: 'absolute',
          top: top + (COLUMN_STAGGER[col] ?? 0),
          left: `calc(${col} * (${COL_WIDTH_EXPR} + ${GAP}px))`,
          width: `calc(${span} * (${COL_WIDTH_EXPR}) + ${(span - 1) * GAP}px)`,
          ...(span === 2 ? { gridColumn: 'span 2' } : {}),
        }

        return (
          <Link
            key={cat.id}
            href={`/produse?categorie=${encodeURIComponent(cat.name)}`}
            className="cat-card"
            style={cardStyle}
          >
            <div className="cat-card-img-wrap">
              {cat.hero_image_url ? (
                <img src={cat.hero_image_url} alt={cat.name} className="cat-card-img" loading="lazy" />
              ) : (
                <div style={{ position: 'absolute', inset: 0, background: `hsl(${(col * 90 + i * 22) % 360}, 6%, 74%)` }} />
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
  )
}
