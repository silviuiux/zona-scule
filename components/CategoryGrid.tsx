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
// Permanent per-column starting offset (px) — this IS the masonry wave, not
// a scroll effect. Decreases left→right so col0's first card sits lowest
// and col3's sits highest, matching the staggered reference layout. This
// never resets/settles to 0 — it's baked into the static layout, so cards
// are always full-size and simply live at a staggered position.
//
// It's seeded directly into the packer's running column heights (below)
// rather than added afterwards per card. Adding it afterwards was the
// actual bug behind the overlap: a wide card spanning two columns with
// DIFFERENT stagger amounts would render lower than its own column's raw
// packed height accounted for, so the next card handed off into the
// less-staggered column started before that wide card's real (staggered)
// bottom edge. Seeding it in means every reservation the packer makes is
// already stagger-aware, so no downstream card can ever start before the
// previous one in its column has actually ended, however columns differ.
const COLUMN_STAGGER = [180, 120, 60, 0]
// Small, uniform one-time entrance rise (see .in-view in page.tsx) — just
// enough to read as a soft fade-up on first appearance. The big, columned
// motion is owned by the continuous de-stagger effect below instead.
const ENTRANCE_TRAVEL = 24
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
// (since every reservation is already stagger-aware) no risk of overlap.
function buildMasonry(cats: Cat[]): { slots: Slot[]; totalHeight: number } {
  const colHeights = [...COLUMN_STAGGER]
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

  const totalHeight = Math.max(CARD_HEIGHT, Math.max(...colHeights) - GAP)
  return { slots, totalHeight }
}
// Column-width expression shared by left/width below — a single column's
// width once the 3 inter-column gaps are subtracted from the container.
const COL_WIDTH_EXPR = `(100% - ${(GRID_COLS - 1) * GAP}px) / ${GRID_COLS}`
// ─────────────────────────────────────────────────────────────────────────

export default function CategoryGrid({ categories }: { categories: Cat[] }) {
  const rootRef = useRef<HTMLDivElement>(null)

  // ── De-stagger on scroll: the whole masonry straightens into a flush grid ──
  // One progress value for the entire section (not per-card), read off the
  // section's own bounding box, so every column unwinds in lockstep as a
  // single continuous motion:
  //   progress 0 → section top has just reached the bottom of the viewport
  //                (cards sit at their full staggered masonry position)
  //   progress 1 → the section's bottom has reached the bottom of the
  //                viewport — i.e. the moment the last row first comes
  //                fully into sight, every column's stagger has already
  //                unwound to 0, so same-row cards line up into a flush
  //                grid right as they arrive, rather than still visibly
  //                sliding into place after you can already see them.
  // Each card just reads this one shared --destagger value (inherited from
  // the container) against its own fixed --col-stagger amount — cheap,
  // since only one property is written per scroll tick, not one per card.
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const isMobile = window.matchMedia?.('(max-width: 768px)').matches
    const root = rootRef.current
    if (!root) return

    if (reduce || isMobile) {
      root.style.setProperty('--destagger', '1')
      return
    }

    let raf = 0
    const update = () => {
      raf = 0
      const viewH = window.innerHeight
      const rect = root.getBoundingClientRect()
      const scrolled = viewH - rect.top
      const target = rect.height
      const linear = Math.max(0, Math.min(1, scrolled / Math.max(target, 1)))
      root.style.setProperty('--destagger', `${easeInOut(linear)}`)
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

  // ── Scroll-into-view reveal: fade + rise into place, cascading top-to-bottom ──
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
          top,
          left: `calc(${col} * (${COL_WIDTH_EXPR} + ${GAP}px))`,
          width: `calc(${span} * (${COL_WIDTH_EXPR}) + ${(span - 1) * GAP}px)`,
          ['--cat-enter' as string]: `${ENTRANCE_TRAVEL}px`,
          ['--col-stagger' as string]: `${COLUMN_STAGGER[col] ?? 0}`,
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
