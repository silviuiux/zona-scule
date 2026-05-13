'use client'
import Link from 'next/link'
import type { FeaturedSubcategoryWithImage } from '@/lib/supabase'

export default function SubcategoryCarousel({ subs }: { subs: FeaturedSubcategoryWithImage[] }) {
  // Duplicate for seamless infinite loop.
  // Each .sub-card has margin-right: 12px (instead of gap) so
  // total set width = N × (card_width + 12px) → translateX(-50%) = exactly one set. ✓
  const doubled = [...subs, ...subs]

  return (
    <>
      <style>{`
        /* Full-width breakout from the max-width container */
        .sub-carousel-outer {
          position: relative;
          left: 50%;
          transform: translateX(-50%);
          width: 100vw;
          overflow: hidden;
        }

        .sub-carousel-track {
          display: flex;
          gap: 0;
          /* padding-left aligns first card with the header above */
          padding-left: max(24px, calc(50vw - 720px + 24px));
          animation: sub-carousel-scroll 55s linear infinite;
          will-change: transform;
        }
        .sub-carousel-track:hover { animation-play-state: paused; }

        @keyframes sub-carousel-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        .sub-card {
          flex-shrink: 0;
          width: 284px; height: 398px;
          margin-right: 12px; /* part of the unit width for seamless loop */
          position: relative; overflow: hidden;
          border-radius: 8px;
          background: rgb(40,40,40);
          text-decoration: none; display: block;
          transition: transform 300ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .sub-card:hover { transform: scale(1.02); }
        .sub-card-img {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover; object-position: center;
          display: block;
          transition: transform 600ms cubic-bezier(0.22, 1, 0.36, 1);
          pointer-events: none;
        }
        .sub-card:hover .sub-card-img { transform: scale(1.06); }
        .sub-card-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.15) 50%, transparent 80%);
        }
        .sub-card-bottom {
          position: absolute; bottom: 0; left: 0; right: 0; padding: 14px;
        }
        .sub-card-count {
          font-family: 'Inter', sans-serif;
          font-size: 10px; font-weight: 600; letter-spacing: 0.06em;
          text-transform: uppercase; color: rgba(255,255,255,0.5);
          display: block; margin-bottom: 4px;
        }
        .sub-card-label {
          font-family: 'Recursive', sans-serif;
          font-size: 14px; font-weight: 500;
          color: rgb(255,255,255); line-height: 1.3; display: block;
        }

        @media (max-width: 768px) {
          .sub-carousel-track {
            padding-left: 16px;
            animation-duration: 40s;
          }
          .sub-card { width: 192px; height: 269px; }
        }
      `}</style>

      <div className="sub-carousel-outer">
        <div className="sub-carousel-track">
          {doubled.map((s, i) => (
            <Link
              key={`${s.id}-${i}`}
              href={`/produse?subcategorie=${encodeURIComponent(s.name)}`}
              className="sub-card"
            >
              {s.image_url && (
                <img src={s.image_url} alt={s.name} className="sub-card-img" loading="lazy" />
              )}
              <div className="sub-card-overlay" />
              <div className="sub-card-bottom">
                <span className="sub-card-count">{s.product_count.toLocaleString('ro')} produse</span>
                <span className="sub-card-label">{s.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
