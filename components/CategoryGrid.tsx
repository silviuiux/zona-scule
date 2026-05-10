'use client'
import { useEffect, useRef, type CSSProperties } from 'react'
import Link from 'next/link'
import Image from 'next/image'

type Cat = {
  id: string
  name: string
  hero_image_url: string | null
  description: string | null
  product_count: number
}

// First-row stagger: each card starts pushed down by N px, then collapses to 0
// as the second row reaches viewport center. Tweak these to taste.
const FIRST_ROW_OFFSETS = [0, 90, 180, 270]
const FALL_DISTANCE = 380 // px of scroll over which the collapse happens

export default function CategoryGrid({ categories }: { categories: Cat[] }) {
  const rowRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const isMobile = window.matchMedia?.('(max-width: 768px)').matches
    const firstRow = rowRefs.current[0]
    const secondRow = rowRefs.current[1]
    if (!firstRow || !secondRow) return

    const firstRowCards = Array.from(
      firstRow.querySelectorAll<HTMLElement>('.cat-card')
    )
    if (firstRowCards.length === 0) return

    // On reduced-motion or mobile, snap to aligned (no stagger).
    if (reduce || isMobile) {
      firstRowCards.forEach(el => el.style.setProperty('--cat-offset', '0px'))
      return
    }

    let raf = 0
    const update = () => {
      raf = 0
      const rect = secondRow.getBoundingClientRect()
      const center = window.innerHeight / 2
      // dy: distance of second row's top from viewport center.
      // > 0 → second row still below center; <= 0 → reached / above center.
      const dy = rect.top - center
      const progress = Math.max(0, Math.min(1, 1 - dy / FALL_DISTANCE))

      firstRowCards.forEach((el, i) => {
        const base = FIRST_ROW_OFFSETS[i] ?? 0
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

  // Chunk categories into rows of 4
  const rows: Cat[][] = []
  for (let i = 0; i < categories.length; i += 4) {
    rows.push(categories.slice(i, i + 4))
  }

  return (
    <>
      {rows.map((row, rowIdx) =>
        row.length > 0 ? (
          <div
            key={rowIdx}
            ref={(el) => {
              rowRefs.current[rowIdx] = el
            }}
            className={`cats-row${rowIdx === 0 ? ' cats-row--staggered' : ''}`}
          >
            {row.map((cat, i) => {
              // Pre-set the initial offset for the first row so SSR / first paint
              // matches the "fully staggered" state before JS hydrates and starts
              // listening to scroll. Avoids a snap.
              const initialStyle: CSSProperties | undefined =
                rowIdx === 0
                  ? ({ ['--cat-offset' as string]: `${FIRST_ROW_OFFSETS[i] ?? 0}px` } as CSSProperties)
                  : undefined

              return (
                <Link
                  key={cat.id}
                  href={`/produse?categorie=${encodeURIComponent(cat.name)}`}
                  className="cat-card"
                  style={initialStyle}
                >
                  <div className="cat-card-img-wrap">
                    {cat.hero_image_url ? (
                      <Image
                        src={cat.hero_image_url}
                        alt={cat.name}
                        fill
                        style={{ objectFit: 'cover' }}
                        unoptimized
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
    </>
  )
}
