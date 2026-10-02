'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getBrandHref } from '@/lib/brand-content'

/** One word of the rotating headline ("Toate ___ de care ai nevoie"), with
 *  what the catalog actually holds behind it. */
export type HeroWord = { text: string; href: string; count: number; noun: string }

/** Fired on window each time the word changes; HeroSearch listens and rolls
 *  its "caută în N de …" count to match. */
export const HERO_WORD_EVENT = 'zs-hero-word'

type Brand = { name: string; product_count: number }

export default function AnimatedHero({ brands, words }: { brands: Brand[]; words: HeroWord[] }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [phase, setPhase] = useState<'visible' | 'exiting'>('visible')

  // An invisible CSS animation times each word (hover pauses it); when it
  // ends, the word swaps.
  const next = () => {
    setPhase('exiting')
    window.setTimeout(() => {
      setActiveIdx(i => (i + 1) % words.length)
      setPhase('visible')
    }, 320)
  }

  useEffect(() => {
    const w = words[activeIdx]
    if (w) window.dispatchEvent(new CustomEvent(HERO_WORD_EVENT, { detail: { count: w.count, noun: w.noun } }))
  }, [activeIdx, words])

  const word = words[activeIdx]

  const topBrands = ['Bosch', 'Karcher', 'Milwaukee', 'Makita', 'Pferd', 'FFGroup']
    .map(name => brands.find(b => b.name.toLowerCase() === name.toLowerCase()))
    .filter((b): b is Brand => !!b && b.product_count > 0)

  return (
    <>
      <style>{`
        /* the hero's first row: 28px tall, 32px above the title (the
           same start as the breadcrumb / eyebrow on the other pages) */
        .brand-chips {
          display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
          min-height: 28px; margin-bottom: 6px; /* + the hero's 26px gap */
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
          height: 28px; padding: 0 14px;
          border-radius: 4px;
          background: #f4f4f4;
          display: inline-flex; align-items: center; gap: 5px;
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
          height: 128px; padding-bottom: 4px; box-sizing: content-box;
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
          display: block; position: relative;
          white-space: nowrap;
          /* starts hidden above */
          transform: translateY(-110%);
          opacity: 0;
          transition: transform 380ms cubic-bezier(0.22, 1, 0.36, 1), opacity 280ms ease;
        }
        /* the clock: an invisible pseudo-element whose animation times how
           long the word stays up (hover or focus pauses it, so the word
           holds still while you go for it) */
        .hero-animated-word::after {
          content: ''; position: absolute; left: 0; bottom: 0; width: 1px; height: 1px;
          opacity: 0; pointer-events: none;
        }
        .hero-animated-word.visible::after { animation: hero-dwell 3400ms linear forwards; }
        .hero-animated-word:hover::after,
        .hero-animated-word:focus-visible::after { animation-play-state: paused; }
        @keyframes hero-dwell { to { transform: translateX(0); } }
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

        /* Mobile: a three-line stack (Toate / word / de care ai nevoie.)
           sized off the viewport so its longest line, "de care ai
           nevoie." (≈6.2em of Neuton), runs nearly gutter to gutter. */
        @media (max-width: 768px) {
          .hero-title { --hero-m: clamp(44px, 14vw, 76px); }
          .hero-line1 {
            flex-direction: column;
            align-items: flex-start;
            gap: 0;
          }
          .hero-word-toate,
          .hero-animated-word,
          .hero-line2 {
            font-size: var(--hero-m);
            line-height: 0.94;
            letter-spacing: -0.015em;
          }
          /* The clip is taller than the line (room for ascenders and the
             p of "aparatele"); the negative margins hand the extra back, so
             in flow it takes the same 0.94em as the lines around it. */
          .hero-word-clip {
            font-size: var(--hero-m);
            height: 1.2em; padding-bottom: 0;
            margin: -0.13em 0;
          }
          .hero-animated-word { line-height: 1.2em; }

          /* Brand chips: one swipeable row, bleeding to the screen edges,
             instead of wrapping onto a second line. */
          .brand-chips {
            flex-wrap: nowrap; gap: 8px;
            overflow-x: auto; overscroll-behavior-x: contain;
            margin: 0 calc(-1 * var(--gutter)) 4px;
            padding: 0 var(--gutter);
            scrollbar-width: none;
            -webkit-mask-image: linear-gradient(90deg, transparent, #000 var(--gutter), #000 calc(100% - 48px), transparent);
                    mask-image: linear-gradient(90deg, transparent, #000 var(--gutter), #000 calc(100% - 48px), transparent);
          }
          .brand-chips::-webkit-scrollbar { display: none; }
          .brand-chip { flex-shrink: 0; height: 32px; }
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
            {word && (
              <Link
                href={word.href}
                className={`hero-animated-word ${phase}`}
                onAnimationEnd={e => { if (e.animationName === 'hero-dwell') next() }}
              >
                {word.text}
              </Link>
            )}
          </div>
        </div>

        {/* Line 2 */}
        <span className="hero-line2">de care ai nevoie.</span>
      </div>
    </>
  )
}
