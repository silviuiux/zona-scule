'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const WORDS = [
  { text: 'SCULELE',     href: '/produse?categorie=Scule%20de%20m%C3%A2n%C4%83' },
  { text: 'ACCESORIILE', href: '/produse?categorie=Accesorii' },
  { text: 'APARATELE',   href: '/produse?categorie=Aparate%20de%20Masura' },
]

type Brand = { name: string; product_count: number }

export default function AnimatedHero({ brands }: { brands: Brand[] }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [phase, setPhase] = useState<'visible' | 'exiting'>('visible')

  useEffect(() => {
    // Respect reduced motion: keep the first word, no rotation.
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

    let timeout: number | undefined
    const t = setInterval(() => {
      if (document.hidden) return // don't churn in background tabs
      setPhase('exiting')
      timeout = window.setTimeout(() => {
        setActiveIdx(i => (i + 1) % WORDS.length)
        setPhase('visible')
      }, 320)
    }, 2500)
    return () => { clearInterval(t); if (timeout) clearTimeout(timeout) }
  }, [])

  const topBrands = ['Karcher', 'Milwaukee', 'Makita', 'Pferd', 'FFGroup']
    .map(name => brands.find(b => b.name.toLowerCase() === name.toLowerCase()))
    .filter((b): b is Brand => !!b && b.product_count > 0)

  return (
    <>
      <style>{`
        .brand-chips {
          display: flex; align-items: baseline; gap: 14px; flex-wrap: wrap;
        }
        .brand-chip {
          font-family: var(--font-recursive), sans-serif;
          font-size: 13px; font-weight: 400;
          color: rgb(0,0,0);
          text-decoration: underline;
          text-underline-offset: 3px;
          text-decoration-thickness: 1px;
          padding: 0; border: none; background: none;
          display: inline-flex; align-items: baseline; gap: 5px;
          transition: color 150ms;
        }
        .brand-chip:hover { color: rgb(217, 44, 43); }

        /* ── Hero title ── */
        .hero-title { display: flex; flex-direction: column; gap: 0; }
        .hero-line1 { display: flex; align-items: center; gap: 18px; }
        .hero-word-toate {
          font-family: var(--font-bungee), sans-serif;
          font-size: clamp(52px, 6.5vw, 96px);
          text-transform: uppercase;
          color: rgb(0,0,0);
          letter-spacing: 0.01em;
          line-height: 1;
          flex-shrink: 0;
        }
        .hero-word-clip {
          height: clamp(52px, 6.5vw, 96px);
          overflow: hidden;
          display: flex;
          align-items: flex-start;
        }
        .hero-animated-word {
          font-family: var(--font-bungee-inline), sans-serif;
          font-size: clamp(52px, 6.5vw, 96px);
          text-transform: uppercase;
          color: rgb(217,44,43);
          letter-spacing: 0.01em;
          text-decoration: none;
          display: block;
          line-height: 1;
          white-space: nowrap;
          transform: translateY(-110%);
          opacity: 0;
          transition: transform 380ms cubic-bezier(0.22, 1, 0.36, 1), opacity 280ms ease;
        }
        .hero-animated-word.visible { transform: translateY(0%); opacity: 1; }
        .hero-animated-word.exiting {
          transform: translateY(110%);
          opacity: 0;
          transition: transform 300ms cubic-bezier(0.55, 0, 1, 0.45), opacity 200ms ease;
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-animated-word { transform: none; opacity: 1; transition: none; }
        }
        .hero-line2 {
          font-family: var(--font-bungee), sans-serif;
          font-size: clamp(52px, 6.5vw, 96px);
          text-transform: uppercase;
          color: rgb(0,0,0);
          letter-spacing: 0.01em;
          line-height: 1;
        }
        @media (max-width: 768px) {
          .hero-line1 { flex-direction: column; align-items: flex-start; gap: 0; }
        }
      `}</style>

      {/* Brand chips */}
      <nav className="brand-chips" aria-label="Branduri populare">
        {topBrands.length > 0 ? topBrands.map(b => (
          <Link key={b.name} href={`/produse?brand=${encodeURIComponent(b.name)}`} className="brand-chip">
            {b.name.toUpperCase()}
          </Link>
        )) : ['KARCHER', 'MILWAUKEE', 'PFERD', 'FFGROUP'].map(n => (
          <Link key={n} href={`/produse?brand=${encodeURIComponent(n)}`} className="brand-chip">{n}</Link>
        ))}
      </nav>

      {/* Headline */}
      <h1 className="hero-title">
        <span className="hero-line1">
          <span className="hero-word-toate">TOATE</span>
          <span className="hero-word-clip">
            <Link
              href={WORDS[activeIdx].href}
              className={`hero-animated-word ${phase}`}
            >
              {WORDS[activeIdx].text}
            </Link>
          </span>
        </span>
        <span className="hero-line2">DE CARE AI NEVOIE</span>
      </h1>
    </>
  )
}
