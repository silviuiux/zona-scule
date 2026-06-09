'use client'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'

/** Supabase storage images go through the Next optimizer (resized AVIF/WebP);
 *  arbitrary manufacturer URLs stay unoptimized (host not allow-listed). */
const OPTIMIZED_HOST = '.supabase.co'

export default function HeroImage({ src, alt }: { src: string | null | undefined; alt: string }) {
  const [lightbox, setLightbox] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  // Escape closes; focus moves into the dialog and returns to the trigger.
  useEffect(() => {
    if (!lightbox) return
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightbox(false) }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      triggerRef.current?.focus()
    }
  }, [lightbox])

  if (!src) {
    return (
      <div style={{
        position: 'relative', width: '100%', aspectRatio: '1/1',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'rgba(0,0,0,0.3)', fontFamily: 'var(--font-recursive), sans-serif', fontSize: '12px',
        background: 'rgb(255,255,255)',
      }}>
        FARA IMAGINE
      </div>
    )
  }

  const optimized = src.includes(OPTIMIZED_HOST)

  return (
    <>
      <style>{`
        .hero-img-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          background: rgb(255,255,255);
          overflow: hidden;
          border-radius: 4px;
          cursor: zoom-in;
          border: none;
          padding: 0;
          display: block;
          view-transition-name: product-hero;
        }
        .hero-img-wrap img {
          transition: transform 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 200ms;
          object-fit: contain !important;
          padding: 32px;
        }
        .hero-img-wrap:hover img { transform: scale(1.04); opacity: 0.95; }
        @media (prefers-reduced-motion: reduce) {
          .hero-img-wrap img { transition: none; }
          .hero-img-wrap:hover img { transform: none; }
        }
        .lightbox-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(0,0,0,0.92);
          display: flex; align-items: center; justify-content: center;
          cursor: zoom-out;
          animation: lb-in 200ms ease;
        }
        @keyframes lb-in { from { opacity: 0; } to { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) {
          .lightbox-overlay { animation: none; }
        }
        .lightbox-inner {
          position: relative;
          width: min(90vw, 90vh);
          height: min(90vw, 90vh);
          background: rgb(255,255,255);
          border-radius: 4px;
          overflow: hidden;
        }
        .lightbox-close {
          position: absolute; top: 16px; right: 16px; z-index: 10;
          width: 36px; height: 36px;
          background: rgba(0,0,0,0.08); border: none;
          border-radius: 50%; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: rgba(0,0,0,0.6); font-size: 16px;
          transition: background 150ms;
        }
        .lightbox-close:hover { background: rgba(0,0,0,0.15); }
      `}</style>

      <button
        ref={triggerRef}
        className="hero-img-wrap"
        onClick={() => setLightbox(true)}
        aria-label={`Mareste imaginea: ${alt}`}
      >
        <Image src={src} alt={alt} fill priority unoptimized={!optimized}
          sizes="(max-width: 768px) 100vw, 50vw" />
      </button>

      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(false)} role="dialog" aria-modal="true" aria-label={alt}>
          <div className="lightbox-inner" onClick={e => e.stopPropagation()}>
            <button ref={closeRef} className="lightbox-close" onClick={() => setLightbox(false)} aria-label="Inchide imaginea marita">✕</button>
            <Image src={src} alt={alt} fill unoptimized={!optimized}
              sizes="90vw" style={{ objectFit: 'contain', padding: '24px' }} />
          </div>
        </div>
      )}
    </>
  )
}
