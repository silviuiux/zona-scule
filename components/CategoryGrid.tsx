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
// Permanent per-column cosmetic offset (px) — this IS the masonry wave, not
// a scroll effect. Decreases left→right so col0 sits lowest and col3 sits
// highest, matching the staggered reference layout.
//
// Crucially, every row shares the SAME baseline height (see buildGrid below)
// — this offset is added on top of that shared baseline purely for looks,
// never folded into the layout math itself. That's what guarantees the
// de-stagger effect (below) can land same-row cards on an exact, common
// line: subtracting a column's fixed offset from its cards always returns
// them to the row's shared baseline, because that's what they were offset
// from in the first place. A true greedy masonry packer (what this used to
// be) doesn't have that property — different columns can accumulate
// different numbers of cards by any given point, so there's no shared line
// for "de-staggered" cards to land on, and the grid never actually lines up.
const COLUMN_STAGGER = [180, 120, 60, 0]
const STAGGER_MAX = Math.max(...COLUMN_STAGGER)
// Row-to-row spacing gets padded by the full stagger range (max - min),
// rather than just CARD_HEIGHT + GAP. Two adjacent rows only ever risk
// overlapping where a featured/wide card touches columns with DIFFERENT
// stagger amounts — e.g. a card spanning col2 (stagger 60) and col3
// (stagger 0) has no single offset that's simultaneously safe against a
// deep-staggered neighbour above and a shallow one below, when the plain
// CARD_HEIGHT + GAP spacing is all that separates rows. Padding every row
// gap by STAGGER_MAX - STAGGER_MIN gives enough slack to cover the worst
// case unconditionally, however cards happen to be arranged.
const STAGGER_RANGE = STAGGER_MAX - Math.min(...COLUMN_STAGGER)
const ROW_HEIGHT = CARD_HEIGHT + GAP + STAGGER_RANGE
// Small, uniform one-time entrance rise (see .in-view in page.tsx) — just
// enough to read as a soft fade-up on first appearance. The big, columned
// motion is owned by the continuous de-stagger effect below instead.
const ENTRANCE_TRAVEL = 24
// easeInOutCubic — accelerate into the line-up, settle gently out of it.
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

// `offset` is the FULL amount this card needs to travel to reach the tight,
// no-padding grid position: it bundles both this card's own cosmetic stagger
// AND its row's share of the ROW_HEIGHT padding (rowIndex * STAGGER_RANGE).
// The CSS transform subtracts offset * --destagger, so at destagger:0 the
// card sits at `top` (padded + staggered) and at :1 it lands exactly on
// rowIndex * (CARD_HEIGHT + GAP) — a genuinely tight grid, not just
// destaggered-but-still-padded. See the de-stagger effect below for why the
// padding has to unwind together with the stagger, not stay baked in.
type Slot = { cat: Cat; col: number; span: number; top: number; offset: number }
type RowSlot = { cat: Cat; colStart: number }

// ── Row builder ───────────────────────────────────────────────────────────
// Places categories left-to-right into GRID_COLS-wide rows (featured
// categories span 2 columns, regular ones span 1) — the same packing every
// plain CSS grid would do. This (not a greedy masonry packer) is what makes
// the de-stagger animation actually resolve into a flush grid: every card in
// a row shares that row's baseline height, so removing each card's cosmetic
// COLUMN_STAGGER always lands it back on the same line as its row-mates.
function buildRows(cats: Cat[]): RowSlot[][] {
  const rows: RowSlot[][] = []
  let row: RowSlot[] = []
  let used = 0

  for (const cat of cats) {
    const span = cat.featured ? 2 : 1
    if (used + span > GRID_COLS) {
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

// Turns rows into absolute-positioned slots: each row gets a shared padded
// baseline top (rowIndex * ROW_HEIGHT), and a stagger is layered on top per
// card purely for the initial staggered look. Regular cards use their own
// column's COLUMN_STAGGER; featured/wide cards always use STAGGER_MAX
// (rather than whichever column they happen to start in) — combined with
// ROW_HEIGHT's extra padding, this guarantees no card can ever overlap a
// neighbour above or below, however the columns it spans compare, at any
// point during the de-stagger transition (not just at rest).
function buildGrid(cats: Cat[]): { slots: Slot[]; totalHeight: number } {
  const rows = buildRows(cats)
  const slots: Slot[] = []

  rows.forEach((row, rowIndex) => {
    const rowPadding = rowIndex * STAGGER_RANGE
    const tightBase = rowIndex * (CARD_HEIGHT + GAP)
    row.forEach(({ cat, colStart }) => {
      const span = cat.featured ? 2 : 1
      const stagger = span === 2 ? STAGGER_MAX : (COLUMN_STAGGER[colStart] ?? 0)
      const offset = rowPadding + stagger
      slots.push({ cat, col: colStart, span, top: tightBase + offset, offset })
    })
  })

  const totalHeight = Math.max(CARD_HEIGHT, (rows.length - 1) * ROW_HEIGHT + STAGGER_MAX + CARD_HEIGHT)
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

  const { slots, totalHeight } = buildGrid(categories)

  return (
    <div ref={rootRef} className="cats-masonry" style={{ height: totalHeight }}>
      {slots.map(({ cat, col, span, top, offset }, i) => {
        const cardStyle: CSSProperties = {
          position: 'absolute',
          top,
          left: `calc(${col} * (${COL_WIDTH_EXPR} + ${GAP}px))`,
          width: `calc(${span} * (${COL_WIDTH_EXPR}) + ${(span - 1) * GAP}px)`,
          ['--cat-enter' as string]: `${ENTRANCE_TRAVEL}px`,
          ['--col-stagger' as string]: `${offset}`,
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
