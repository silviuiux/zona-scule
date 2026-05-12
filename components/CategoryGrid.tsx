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

// Per-column vertical offset (px). Reversed so col 0 sits lowest.
const COL_OFFSETS = [270, 180, 90, 0]
const FALL_DISTANCE = 520

// ── Layout config ─────────────────────────────────────────────────────────────
// Each row is an array of category names in display order.
// Categories in WIDE_CATS get grid-column: span 2.
const WIDE_CATS = new Set(['Scule electrice', 'Consumabile', 'Scule de gradina'])

// Row 1: [W=2] + [1] + [1] = 4 cols  (3 items)
// Row 2: [W=2] + [1] + [1] = 4 cols  (3 items)
// Row 3: [1] + [1] + [W=2] = 4 cols  (3 items)
// Row 4: [1] + [1] + [1] + [1] = 4 cols  (4 items)
const CAT_LAYOUT: string[][] = [
  ['Scule electrice', 'Accesorii', 'Scule de mână'],
  ['Consumabile', 'Curatenie', 'Constructii'],
  ['Echipament de protectie', 'Depozitare & Organizare', 'Scule de gradina'],
  ['Scule pneumatice', 'Fixare & Asamblare', 'Aparate de Masura', 'Energie & Iluminat'],
]

// Starting column position for stagger offset (wide cards use their left edge)
const CAT_COL: Record<string, number> = {
  // Row 1
  'Scule electrice': 0,            // spans cols 0-1
  'Accesorii': 2,
  'Scule de mână': 3,
  // Row 2
  'Consumabile': 0,                // spans cols 0-1
  'Curatenie': 2,
  'Constructii': 3,
  // Row 3
  'Echipament de protectie': 0,
  'Depozitare & Organizare': 1,
  'Scule de gradina': 2,           // spans cols 2-3
  // Row 4
  'Scule pneumatice': 0,
  'Fixare & Asamblare': 1,
  'Aparate de Masura': 2,
  'Energie & Iluminat': 3,
}
// ─────────────────────────────────────────────────────────────────────────────

export default function CategoryGrid({ categories }: { categories: Cat[] }) {
  const rootRef = useRef<HTMLDivElement>(null)

  // ── Effect 1: scroll-driven stagger ──
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

  // ── Effect 2: in-view reveal ──
  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const allCards = Array.from(root.querySelectorAll<HTMLElement>('.cat-card'))
    if (allCards.length === 0) return

    if (reduce) { allCards.forEach(el => el.classList.add('in-view')); return }

    const timeouts: number[] = []
    const reveal = (cards: HTMLElement[], baseDelay: number) => {
      cards.forEach((card, i) => {
        timeouts.push(window.setTimeout(() => card.classList.add('in-view'), baseDelay + i * 60))
      })
    }

    const rows = Array.from(root.querySelectorAll<HTMLElement>('.cats-row'))
    if (rows[0]) reveal(Array.from(rows[0].querySelectorAll<HTMLElement>('.cat-card')), 600)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal(Array.from(entry.target.querySelectorAll<HTMLElement>('.cat-card')), 0)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    )
    rows.slice(1).forEach(row => observer.observe(row))

    return () => { observer.disconnect(); timeouts.forEach(clearTimeout) }
  }, [])

  // Build a lookup map by name for fast access
  const catsByName = Object.fromEntries(categories.map(c => [c.name, c]))

  // Collect names already placed in the fixed layout
  const layoutNames = new Set(CAT_LAYOUT.flat())

  // Any categories not in the layout fall into overflow rows of 4
  const overflow = categories.filter(c => !layoutNames.has(c.name))
  const overflowRows: Cat[][] = []
  for (let i = 0; i < overflow.length; i += 4) overflowRows.push(overflow.slice(i, i + 4))

  const renderCard = (name: string, rowIdx: number) => {
    const cat = catsByName[name]
    if (!cat) return null
    const isWide = WIDE_CATS.has(name)
    const colPos = CAT_COL[name] ?? 0
    const initialStyle = ({
      ['--cat-offset' as string]: `${COL_OFFSETS[colPos] ?? 0}px`,
      ...(isWide ? { gridColumn: 'span 2' } : {}),
    } as CSSProperties)

    return (
      <Link
        key={cat.id}
        href={`/produse?categorie=${encodeURIComponent(cat.name)}`}
        className="cat-card"
        style={initialStyle}
        data-col={colPos}
      >
        <div className="cat-card-img-wrap">
          {cat.hero_image_url ? (
            <img src={cat.hero_image_url} alt={cat.name} className="cat-card-img" loading="lazy" />
          ) : (
            <div style={{ position: 'absolute', inset: 0, background: `hsl(${(rowIdx * 90 + colPos * 22) % 360}, 6%, 74%)` }} />
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
  }

  return (
    <div ref={rootRef}>
      {/* Fixed layout rows */}
      {CAT_LAYOUT.map((rowNames, rowIdx) => (
        <div key={rowIdx} className="cats-row">
          {rowNames.map(name => renderCard(name, rowIdx))}
        </div>
      ))}

      {/* Overflow rows (any categories not in the fixed layout) */}
      {overflowRows.map((row, idx) => (
        <div key={`overflow-${idx}`} className="cats-row">
          {row.map((cat, i) => {
            const initialStyle = ({ ['--cat-offset' as string]: `${COL_OFFSETS[i] ?? 0}px` } as CSSProperties)
            return (
              <Link key={cat.id} href={`/produse?categorie=${encodeURIComponent(cat.name)}`}
                className="cat-card" style={initialStyle} data-col={i}>
                <div className="cat-card-img-wrap">
                  {cat.hero_image_url
                    ? <img src={cat.hero_image_url} alt={cat.name} className="cat-card-img" loading="lazy" />
                    : <div style={{ position: 'absolute', inset: 0, background: `hsl(${(idx * 90 + i * 22) % 360}, 6%, 74%)` }} />}
                </div>
                <div className="cat-card-overlay" />
                <div className="cat-card-bottom">
                  <span className="cat-card-count">{cat.product_count > 0 ? cat.product_count.toLocaleString('ro') : '—'} produse</span>
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
