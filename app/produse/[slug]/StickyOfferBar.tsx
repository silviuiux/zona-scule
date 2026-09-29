'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

/**
 * A slim bar at the bottom of the screen with the product and "Cere ofertă",
 * shown once the hero ([data-offer-watch]) has scrolled away and hidden
 * again while the footer is in view.
 */
export default function StickyOfferBar({ brand, title, href }: { brand: string | null; title: string; href: string }) {
  const [heroGone, setHeroGone] = useState(false)
  const [footerIn, setFooterIn] = useState(false)

  useEffect(() => {
    const hero = document.querySelector('[data-offer-watch]')
    const footer = document.querySelector('footer')
    const io = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (e.target === hero) setHeroGone(!e.isIntersecting && e.boundingClientRect.top < 0)
        else setFooterIn(e.isIntersecting)
      }
    })
    if (hero) io.observe(hero)
    if (footer) io.observe(footer)
    return () => io.disconnect()
  }, [])

  const shown = heroGone && !footerIn
  return (
    <div className={`pd-bar${shown ? ' on' : ''}`} aria-hidden={!shown}>
      <style>{`
        .pd-bar {
          position: fixed; left: 50%; bottom: 20px; z-index: 80;
          width: min(760px, calc(100vw - 2 * var(--gutter)));
          display: flex; align-items: center; gap: 16px; padding: 8px 8px 8px 20px;
          background: rgba(255,255,255,0.86); backdrop-filter: blur(14px) saturate(1.2); -webkit-backdrop-filter: blur(14px) saturate(1.2);
          border: 1px solid rgba(0,0,0,0.08); border-radius: 6px;
          box-shadow: 0 12px 36px rgba(0,0,0,0.1);
          transform: translate(-50%, calc(100% + 40px)); opacity: 0;
          transition: transform 500ms cubic-bezier(0.2, 0.7, 0.1, 1), opacity 300ms;
        }
        .pd-bar.on { transform: translate(-50%, 0); opacity: 1; }
        .pd-bar-brand { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10.5px; letter-spacing: 0.14em; text-transform: uppercase; color: rgb(217,44,43); flex-shrink: 0; }
        .pd-bar-title { font-family: 'Recursive', sans-serif; font-size: 13px; color: rgb(0,0,0); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
        .pd-bar-btn {
          margin-left: auto; flex-shrink: 0; display: inline-flex; align-items: center; gap: 10px; height: 40px; padding: 0 20px;
          background: rgb(18,18,18); color: rgb(255,255,255); border-radius: 4px; text-decoration: none;
          font-family: 'Oswald', 'Inter', sans-serif; font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase;
          transition: background 150ms;
        }
        .pd-bar-btn:hover { background: rgb(217,44,43); }
        @media (max-width: 640px) { .pd-bar-brand { display: none; } }
      `}</style>
      {brand && <span className="pd-bar-brand">{brand}</span>}
      <span className="pd-bar-title">{title}</span>
      <Link href={href} className="pd-bar-btn" tabIndex={shown ? 0 : -1}>Cere ofertă <span aria-hidden="true">→</span></Link>
    </div>
  )
}
