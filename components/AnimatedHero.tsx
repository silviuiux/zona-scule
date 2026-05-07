'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const WORDS = [
  { text: 'SCULELE',        href: '/produse?categorie=Scule%20de%20m%C3%A2n%C4%83' },
  { text: 'ACCESORIILE',    href: '/produse?categorie=Accesorii%20%26%20Abrazive' },
  { text: 'ECHIPAMENTELE',  href: '/produse?categorie=Echipament%20de%20protec%C8%9Bie' },
]

type Brand = { name: string; product_count: number }

export default function AnimatedHero({ brands }: { brands: Brand[] }) {
  const [activeIdx, setActiveIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => {
      setActiveIdx(i => (i + 1) % WORDS.length)
    }, 2000)
    return () => clearInterval(t)
  }, [])

  const topBrands = ['Karcher', 'Milwaukee', 'Makita', 'Pferd', 'FFGroup']
    .map(name => brands.find(b => b.name.toLowerCase() === name.toLowerCase()))
    .filter((b): b is Brand => !!b && b.product_count > 0)

  return (
    <>
      <style>{`
        /* Brand chips */
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
          transition: border-color 150ms, color 150ms, background 150ms;
          display: inline-flex; align-items: center; gap: 5px;
        }
        .brand-chip:hover {
          border-color: rgb(217,44,43); color: rgb(217,44,43);
          background: rgba(217,44,43,0.04);
        }
        .brand-chip-count {
          font-size: 10px; font-weight: 500; color: rgba(0,0,0,0.35);
          font-family: 'Inter', sans-serif;
        }
        .brand-chip:hover .brand-chip-count { color: rgba(217,44,43,0.6); }

        /* Stacked headline */
        .hero-headline {
          display: flex; flex-direction: column;
          gap: 0; line-height: 1;
          font-family: 'Bungee Inline', 'Bungee', sans-serif;
          font-size: clamp(56px, 6.5vw, 96px);
          text-transform: uppercase;
          color: rgb(217,44,43);
          letter-spacing: 0.01em;
          overflow: hidden;
        }

        /* Each word row — clip to one line height */
        .word-row {
          overflow: hidden;
          height: 1.05em; /* one line */
        }

        /* The word itself slides from top → resting → exits bottom */
        .word-inner {
          display: block;
          transform: translateY(-110%);
          opacity: 0;
          transition: transform 400ms cubic-bezier(0.22, 1, 0.36, 1),
                      opacity 300ms ease;
          text-decoration: none;
          color: rgb(217,44,43);
        }
        .word-inner.visible {
          transform: translateY(0);
          opacity: 1;
        }
        .word-inner.exiting {
          transform: translateY(110%);
          opacity: 0;
        }

        /* "Todas / de care ai nevoie" parts stay static */
        .hero-headline-static {
          font-family: 'Bungee Inline', 'Bungee', sans-serif;
          font-size: clamp(56px, 6.5vw, 96px);
          text-transform: uppercase;
          letter-spacing: 0.01em;
          color: rgb(0,0,0);
          line-height: 1.05;
        }
      `}</style>

      {/* Brand chips */}
      <div className="brand-chips">
        <span className="brand-chips-label">Distribuitor autorizat:</span>
        {topBrands.map(b => (
          <Link key={b.name} href={`/produse?brand=${encodeURIComponent(b.name)}`} className="brand-chip">
            {b.name.toUpperCase()}
            <span className="brand-chip-count">{b.product_count.toLocaleString('ro')}</span>
          </Link>
        ))}
      </div>

      {/* Headline: "TOATE / [SCULELE|ACCESORIILE|ECHIPAMENTELE] / DE CARE AI NEVOIE" */}
      <div>
        <p className="hero-headline-static">TOATE</p>

        {/* Animated stacked words — only activeIdx is visible */}
        <div className="hero-headline">
          {WORDS.map((w, i) => (
            <div key={w.text} className="word-row">
              <Link
                href={w.href}
                className={`word-inner${
                  i === activeIdx ? ' visible' :
                  i === (activeIdx - 1 + WORDS.length) % WORDS.length ? ' exiting' : ''
                }`}
              >
                {w.text}
              </Link>
            </div>
          ))}
        </div>

        <p className="hero-headline-static">DE CARE AI NEVOIE</p>
      </div>
    </>
  )
}
