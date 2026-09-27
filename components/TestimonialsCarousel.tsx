'use client'
import { useEffect, useRef, useState } from 'react'
import type { Testimonial } from '@/lib/testimonials'

/**
 * Horizontal scroll-snap carousel of client quotes. Native scrolling does the
 * work (swipe, trackpad, keyboard); the arrow buttons scroll by one card and
 * the mono counter tracks whichever card sits at the start of the track.
 */
export default function TestimonialsCarousel({ items }: { items: Testimonial[] }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const update = () => {
      const card = track.firstElementChild as HTMLElement | null
      const step = card ? card.offsetWidth + 16 : track.clientWidth
      const max = track.scrollWidth - track.clientWidth
      setAtStart(track.scrollLeft <= 2)
      setAtEnd(track.scrollLeft >= max - 2)
      // At the far end the last card may never reach the start edge.
      setIndex(track.scrollLeft >= max - 2 ? items.length - 1 : Math.round(track.scrollLeft / step))
    }
    update()
    track.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      track.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [items.length])

  const scrollByCard = (dir: 1 | -1) => {
    const track = trackRef.current
    const card = track?.firstElementChild as HTMLElement | null
    if (!track || !card) return
    track.scrollBy({ left: dir * (card.offsetWidth + 16), behavior: 'smooth' })
  }

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className="tm">
      <style>{`
        .tm-head {
          display: flex; align-items: flex-end; justify-content: space-between;
          gap: 24px; margin-bottom: 48px;
        }
        .tm-controls { display: flex; align-items: center; gap: 16px; flex-shrink: 0; }
        .tm-count {
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 12px; font-weight: 500; letter-spacing: 0.08em;
          color: rgba(0,0,0,0.4); min-width: 64px; text-align: right;
        }
        .tm-count b { color: rgb(0,0,0); font-weight: 500; }
        .tm-btn {
          width: 44px; height: 44px; border-radius: 999px;
          border: 1px solid rgba(0,0,0,0.12); background: rgb(255,255,255);
          display: inline-flex; align-items: center; justify-content: center;
          cursor: pointer; color: rgb(0,0,0);
          transition: border-color 150ms, color 150ms, opacity 150ms;
        }
        .tm-btn:hover:not(:disabled) { border-color: rgb(217,44,43); color: rgb(217,44,43); }
        .tm-btn:disabled { opacity: 0.35; cursor: default; }

        .tm-track {
          display: flex; gap: 16px;
          overflow-x: auto; scroll-snap-type: x mandatory;
          scrollbar-width: none; -ms-overflow-style: none;
          overscroll-behavior-x: contain;
        }
        .tm-track::-webkit-scrollbar { display: none; }
        .tm-card {
          flex: 0 0 calc((100% - 32px) / 3);
          scroll-snap-align: start;
          background: rgb(255,255,255);
          border: 1px solid rgba(0,0,0,0.08);
          padding: 40px 32px 32px;
          display: flex; flex-direction: column; gap: 32px;
          min-height: 360px;
          transition: border-color 300ms;
        }
        .tm-card:hover { border-color: rgba(0,0,0,0.16); }
        .tm-mark {
          font-family: 'Neuton', serif; font-size: 72px; line-height: 0.5;
          color: rgb(217,44,43); height: 28px;
        }
        .tm-quote {
          font-family: 'Neuton', serif; font-weight: 400;
          font-size: clamp(20px, 1.7vw, 24px); line-height: 1.3;
          color: rgb(0,0,0); flex: 1;
        }
        .tm-who {
          display: flex; flex-direction: column; gap: 6px;
          padding-top: 20px; border-top: 1px solid rgba(0,0,0,0.08);
        }
        .tm-name {
          font-family: 'Recursive', sans-serif; font-size: 14px; font-weight: 500;
          color: rgb(0,0,0);
        }
        .tm-meta {
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase;
          color: rgba(0,0,0,0.45);
        }

        @media (max-width: 1024px) { .tm-card { flex-basis: calc((100% - 16px) / 2); } }
        @media (max-width: 768px) {
          .tm-head { margin-bottom: 32px; }
          .tm-count { display: none; }
          .tm-card { flex-basis: 86%; min-height: 320px; padding: 32px 24px 24px; }
        }
      `}</style>

      <div className="tm-head">
        <div className="section-head">
          <span className="eyebrow-mono">Ce spun clienții</span>
          <h2 className="display-title">Testimoniale</h2>
        </div>
        <div className="tm-controls">
          <span className="tm-count" aria-live="polite">
            <b>{pad(index + 1)}</b> / {pad(items.length)}
          </span>
          <button className="tm-btn" onClick={() => scrollByCard(-1)} disabled={atStart} aria-label="Testimonialul anterior">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <button className="tm-btn" onClick={() => scrollByCard(1)} disabled={atEnd} aria-label="Testimonialul următor">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        </div>
      </div>

      <div className="tm-track" ref={trackRef}>
        {items.map((t, i) => (
          <figure key={i} className="tm-card">
            <span className="tm-mark" aria-hidden="true">&ldquo;</span>
            <blockquote className="tm-quote">{t.quote}</blockquote>
            <figcaption className="tm-who">
              <span className="tm-name">{t.name}</span>
              <span className="tm-meta">{t.role} · {t.city}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}
