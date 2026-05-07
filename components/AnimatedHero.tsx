'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const WORDS = [
  { text: 'sculele', href: '/produse?categorie=Scule%20de%20m%C3%A2n%C4%83' },
  { text: 'echipamentele', href: '/produse?categorie=Echipament%20de%20protec%C8%9Bie' },
  { text: 'accesoriile', href: '/produse?categorie=Accesorii%20%26%20Abrazive' },
]

type Brand = { name: string; product_count: number }

export default function AnimatedHero({ brands }: { brands: Brand[] }) {
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      setVisible(false)
      setTimeout(() => {
        setIdx(i => (i + 1) % WORDS.length)
        setVisible(true)
      }, 300)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const current = WORDS[idx]

  // Top 5 brands to show
  const topBrands = ['Karcher', 'Milwaukee', 'Makita', 'Pferd', 'FFGroup']
    .map(name => {
      const found = brands.find(b => b.name.toLowerCase() === name.toLowerCase())
      return found || { name, product_count: 0 }
    })
    .filter(b => b.product_count > 0)

  return (
    <>
      <style>{`
        .animated-word {
          display: inline-block;
          font-family: 'Bungee', sans-serif;
          color: rgb(217,44,43);
          -webkit-text-stroke: 2px rgb(217,44,43);
          -webkit-text-fill-color: transparent;
          transition: opacity 300ms ease, transform 300ms ease;
          text-decoration: none;
          cursor: pointer;
        }
        .animated-word:hover {
          -webkit-text-fill-color: rgb(217,44,43);
        }
        .animated-word.fade-in { opacity: 1; transform: translateY(0); }
        .animated-word.fade-out { opacity: 0; transform: translateY(-8px); }

        .brand-chips {
          display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
        }
        .brand-chips-label {
          font-family: 'Recursive', sans-serif;
          font-size: 13px; color: rgba(0,0,0,0.5);
        }
        .brand-chip {
          font-family: 'Recursive', sans-serif;
          font-size: 13px; font-weight: 600;
          color: rgb(0,0,0); text-decoration: none;
          padding: 3px 10px;
          border: 1px solid rgba(0,0,0,0.15);
          border-radius: 4px;
          transition: border-color 150ms, color 150ms, background 150ms;
          display: inline-flex; align-items: center; gap: 5px;
        }
        .brand-chip:hover {
          border-color: rgb(217,44,43);
          color: rgb(217,44,43);
          background: rgba(217,44,43,0.04);
        }
        .brand-chip-count {
          font-size: 10px; font-weight: 500;
          color: rgba(0,0,0,0.35);
          font-family: 'Inter', sans-serif;
        }
        .brand-chip:hover .brand-chip-count { color: rgba(217,44,43,0.6); }
      `}</style>

      {/* Brand chips */}
      <div className="brand-chips">
        <span className="brand-chips-label">Distribuitor autorizat:</span>
        {topBrands.map(b => (
          <Link
            key={b.name}
            href={`/produse?brand=${encodeURIComponent(b.name)}`}
            className="brand-chip"
          >
            {b.name.toUpperCase()}
            <span className="brand-chip-count">{b.product_count.toLocaleString('ro')}</span>
          </Link>
        ))}
      </div>

      {/* Animated headline */}
      <h1 className="hero-headline">
        toate{' '}
        <Link
          href={current.href}
          className={`animated-word ${visible ? 'fade-in' : 'fade-out'}`}
        >
          {current.text}
        </Link>
        <br />
        de care ai nevoie
      </h1>
    </>
  )
}
