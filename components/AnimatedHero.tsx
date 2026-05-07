'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const WORDS = [
  { text: 'SCULELE',       href: '/produse?categorie=Scule%20de%20m%C3%A2n%C4%83' },
  { text: 'ACCESORIILE',   href: '/produse?categorie=Accesorii%20%26%20Abrazive' },
  { text: 'ECHIPAMENTELE', href: '/produse?categorie=Echipament%20de%20protec%C8%9Bie' },
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

  const topBrands = ['Karcher', 'Milwaukee', 'Makita', 'Pferd', 'FFGroup']
    .map(name => brands.find(b => b.name.toLowerCase() === name.toLowerCase()))
    .filter((b): b is Brand => !!b && b.product_count > 0)

  return (
    <>
      <style>{`
        .brand-chips {
          display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
        }
        .brand-chips-label {
          font-family: 'Recursive', sans-serif;
          font-size: 13px; color: rgba(0,0,0,0.5);
        }
        .brand-chip {
          font-family: 'Recursive', sans-serif;
          font-size: 13px; font-weight: 600; color: rgb(0,0,0);
          text-decoration: none; padding: 3px 10px;
          border: 1px solid rgba(0,0,0,0.15); border-radius: 4px;
          background: rgb(255,255,255);
          transition: border-color 150ms, color 150ms, background 150ms;
          display: inline-flex; align-items: center; gap: 5px;
        }
        .brand-chip:hover { border-color: rgb(217,44,43); color: rgb(217,44,43); background: rgba(217,44,43,0.04); }
        .brand-chip-count { font-size: 10px; font-weight: 500; color: rgba(0,0,0,0.35); font-family: 'Inter', sans-serif; }
        .brand-chip:hover .brand-chip-count { color: rgba(217,44,43,0.6); }

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
          font-family: 'Bungee', sans-serif;
          font-size: clamp(52px, 6.5vw, 96px);
          text-transform: uppercase;
          color: rgb(0,0,0);
          letter-spacing: 0.01em;
          line-height: 1;
          flex-shrink: 0;
        }

        /* Fixed height container matching Framer's 96px — clips slide animation */
        .hero-word-clip {
          height: clamp(52px, 6.5vw, 96px);
          overflow: hidden;
          display: flex;
          align-items: flex-start;
        }

        .hero-animated-word {
          font-family: 'Bungee Inline', sans-serif;
          font-size: clamp(52px, 6.5vw, 96px);
          text-transform: uppercase;
          color: rgb(217,44,43);
          letter-spacing: 0.01em;
          text-decoration: none;
          display: block;
          line-height: 1;
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

        /* Line 2: DE CARE AI NEVOIE */
        .hero-line2 {
          font-family: 'Bungee', sans-serif;
          font-size: clamp(52px, 6.5vw, 96px);
          text-transform: uppercase;
          color: rgb(0,0,0);
          letter-spacing: 0.01em;
          line-height: 1;
        }
      `}</style>

      {/* Brand chips */}
      <div className="brand-chips">
        <span className="brand-chips-label">Distribuitor autorizat:</span>
        {topBrands.length > 0 ? topBrands.map(b => (
          <Link key={b.name} href={`/produse?brand=${encodeURIComponent(b.name)}`} className="brand-chip">
            {b.name.toUpperCase()}
            <span className="brand-chip-count">{b.product_count.toLocaleString('ro')}</span>
          </Link>
        )) : ['KARCHER', 'MILWAUKEE', 'PFERD', 'FFGROUP'].map(n => (
          <Link key={n} href={`/produse?brand=${encodeURIComponent(n)}`} className="brand-chip">{n}</Link>
        ))}
      </div>

      {/* Headline */}
      <div className="hero-title">
        {/* Line 1: TOATE [animated] */}
        <div className="hero-line1">
          <span className="hero-word-toate">TOATE</span>
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
        <span className="hero-line2">DE CARE AI NEVOIE</span>
      </div>
    </>
  )
}
