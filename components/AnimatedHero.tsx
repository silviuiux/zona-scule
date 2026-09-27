'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getBrandHref } from '@/lib/brand-content'

const WORDS = [
  { text: 'sculele',       href: '/produse?categorie=Scule%20de%20m%C3%A2n%C4%83' },
  { text: 'accesoriile',   href: '/produse?categorie=Accesorii%20%26%20Abrazive' },
  { text: 'aparatele',     href: '/produse?categorie=Aparate%20de%20Masura' },
]

type Brand = { name: string; product_count: number }

export default function AnimatedHero({ brands }: { brands: Brand[] }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [phase, setPhase] = useState<'visible' | 'exiting'>('visible')

  useEffect(() => {
    const t = setInterval(() => {
      setPhase('exiting')
      setTimeout(() => {
        setActiveIdx(i => (i + 1) % WORDS.length)
        setPhase('visible')
      }, 320)
    }, 2500)
    return () => clearInterval(t)
  }, [])

  const topBrands = ['Bosch', 'Karcher', 'Milwaukee', 'Makita', 'Pferd', 'FFGroup']
    .map(name => brands.find(b => b.name.toLowerCase() === name.toLowerCase()))
    .filter((b): b is Brand => !!b && b.product_count > 0)

  return (
    <>
      <style>{`
        .brand-chips {
          display: flex; align-items: baseline; gap: 14px; flex-wrap: wrap;
        }
        .brand-chips-label {
          font-family: 'Recursive', sans-serif;
          font-size: 13px; color: rgba(0,0,0,0.5);
        }
        /* Brand pill: name + count inside a rounded pill chip. */
        .brand-chip {
          font-family: 'Montserrat', sans-serif;
          font-size: 12px; font-weight: 500;
          color: rgb(0,0,0);
          text-decoration: none;
          padding: 6px 14px;
          border-radius: 4px;
          background: #f4f4f4;
          display: inline-flex; align-items: baseline; gap: 5px;
          transition: color 150ms, background-color 150ms;
        }
        .brand-chip:hover {
          color: rgb(217, 44, 43);
        }
        /* Count rides along inside the same pill, slightly smaller */
        .brand-chip-count {
          font-family: 'Inter', sans-serif;
          font-size: 11px; font-weight: 400;
          color: inherit;
          letter-spacing: 0.01em;
        }

        /* ── Hero title ── */
        .hero-title {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        /* Line 1: TOATE + animated word — horizontal stack, gap 18px, vertically centered */
        .hero-line1 {
          display: flex;
          align-items: center;
          gap: 18px;
          /* NO overflow hidden here — let text breathe */
        }

        .hero-word-toate {
          font-family: 'Neuton', serif;
          font-weight: 400;
          font-size: 128px;
          line-height: 96px;
          color: rgb(0,0,0);
          flex-shrink: 0;
        }

        /* Clips the slide animation. Sized to the font-size, not the
           tighter line-height above — Neuton's glyphs at 128px are taller
           than the 96px line box, and matching the clip height to that
           line-height was cropping the tops of the animated word's letters.
           align-items: center (not flex-start) matters just as much: "Toate"
           is a plain inline span, so the flex row centers its shorter 96px
           line box within the row's 128px height automatically. The clip
           div is already 128px tall itself, so flex-start pinned its 96px
           line box to the very top — sitting visibly higher than "Toate".
           Centering it here lands both words on the same baseline. */
        .hero-word-clip {
          height: 128px;
          overflow: hidden;
          display: flex;
          align-items: center;
        }

        .hero-animated-word {
          font-family: 'Neuton', serif;
          font-weight: 400;
          font-size: 128px;
          line-height: 96px;
          color: rgb(217,44,43);
          text-decoration: none;
          display: block;
          white-space: nowrap;
          /* starts hidden above */
          transform: translateY(-110%);
          opacity: 0;
          transition: transform 380ms cubic-bezier(0.22, 1, 0.36, 1), opacity 280ms ease;
        }
        .hero-animated-word.visible {
          transform: translateY(0%);
          opacity: 1;
        }
        .hero-animated-word.exiting {
          transform: translateY(110%);
          opacity: 0;
          transition: transform 300ms cubic-bezier(0.55, 0, 1, 0.45), opacity 200ms ease;
        }

        /* Line 2: de care ai nevoie */
        .hero-line2 {
          font-family: 'Neuton', serif;
          font-weight: 400;
          font-size: 128px;
          line-height: 96px;
          color: rgb(0,0,0);
        }

        /* 128px/96px is the Neuton title's intended desktop size — step it
           down on narrower viewports so it doesn't overflow before the
           mobile breakpoint takes over. */
        /* Laptops / iPads: still big, but small enough that the category
           bento climbs into the first fold. */
        @media (max-width: 1366px) {
          .hero-word-toate,
          .hero-animated-word,
          .hero-line2 {
            font-size: 88px;
            line-height: 70px;
          }
          .hero-word-clip { height: 92px; }
        }
        @media (max-width: 1100px) {
          .hero-word-toate,
          .hero-animated-word,
          .hero-line2 {
            font-size: 68px;
            line-height: 58px;
          }
          .hero-word-clip { height: 74px; }
        }

        /* On mobile, stack the animated word below TOATE so it doesn't overflow */
        @media (max-width: 768px) {
          .hero-line1 {
            flex-direction: column;
            align-items: flex-start;
            gap: 0;
          }
          .hero-word-toate,
          .hero-animated-word,
          .hero-line2 {
            font-size: 36px;
            line-height: 1.05;
          }
          .hero-word-clip { height: 44px; }
        }
      `}</style>

      {/* Brand chips */}
      <div className="brand-chips">
        {topBrands.length > 0 ? topBrands.map(b => (
          <Link key={b.name} href={getBrandHref(b.name)} className="brand-chip">
            {b.name.toUpperCase()}
          </Link>
        )) : ['Bosch', 'Karcher', 'Milwaukee', 'Pferd', 'FFGroup'].map(n => (
          <Link key={n} href={getBrandHref(n)} className="brand-chip">{n.toUpperCase()}</Link>
        ))}

      </div>

      {/* Headline */}
      <div className="hero-title">
        {/* Line 1: TOATE [animated] */}
        <div className="hero-line1">
          <span className="hero-word-toate">Toate</span>
          <div className="hero-word-clip">
            <Link
              href={WORDS[activeIdx].href}
              className={`hero-animated-word ${phase}`}
            >
              {WORDS[activeIdx].text}
            </Link>
          </div>
        </div>

        {/* Line 2 */}
        <span className="hero-line2">de care ai nevoie</span>
      </div>
    </>
  )
}
