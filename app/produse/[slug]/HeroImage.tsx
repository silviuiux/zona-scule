'use client'
import Image from 'next/image'
import { useState } from 'react'

export default function HeroImage({ src, alt }: { src: string | null | undefined; alt: string }) {
  const [lightbox, setLightbox] = useState(false)

  if (!src) {
    return (
      <div style={{
        position: 'relative', width: '100%', aspectRatio: '1/1',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'rgba(0,0,0,0.2)', fontFamily: 'Recursive, sans-serif', fontSize: '12px',
        background: 'var(--paper)', borderRadius: '12px',
      }}>
        NO IMAGE
      </div>
    )
  }

  return (
    <>
      <style>{`
        /* Clean paper mount so the product cutout reads correctly */
        .hero-img-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          background: var(--paper);
          overflow: hidden;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.06);
          cursor: zoom-in;
          view-transition-name: product-hero;
        }
        /* #5: subtle hover effect */
        .hero-img-wrap img {
          transition: transform 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 200ms;
          object-fit: contain !important;
          padding: 32px;
        }
        .hero-img-wrap:hover img {
          transform: scale(1.04);
          opacity: 0.95;
        }
        /* Lightbox */
        .lightbox-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(0,0,0,0.92);
          display: flex; align-items: center; justify-content: center;
          cursor: zoom-out;
          animation: lb-in 200ms ease;
        }
        @keyframes lb-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .lightbox-inner {
          position: relative;
          width: min(90vw, 90vh);
          height: min(90vw, 90vh);
          background: var(--paper);
          border-radius: 12px;
          overflow: hidden;
        }
        .lightbox-close {
          position: absolute; top: 16px; right: 16px; z-index: 10;
          width: 32px; height: 32px;
          background: rgba(0,0,0,0.08); border: none;
          border-radius: 50%; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: rgba(0,0,0,0.5); font-size: 16px;
          transition: background 150ms;
        }
        .lightbox-close:hover { background: rgba(0,0,0,0.15); }
      `}</style>

      {/* Hero image — click opens lightbox */}
      <div className="hero-img-wrap" onClick={() => setLightbox(true)}>
        <Image src={src} alt={alt} fill priority sizes="(max-width: 768px) 100vw, 50vw" />
      </div>

      {/* #5: Lightbox */}
      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(false)}>
          <div className="lightbox-inner" onClick={e => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setLightbox(false)}>✕</button>
            <Image src={src} alt={alt} fill sizes="90vw" style={{ objectFit: 'contain', padding: '24px' }} />
          </div>
        </div>
      )}
    </>
  )
}
