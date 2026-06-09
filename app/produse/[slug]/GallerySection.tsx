'use client'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

const OPTIMIZED_HOST = '.supabase.co'

export default function GallerySection({ images, productName }: { images: string[]; productName: string }) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  const cols = Math.min(images.length, 3)
  const open = lightboxIdx !== null

  // Keyboard: Escape closes, arrows navigate.
  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIdx(null)
      if (e.key === 'ArrowLeft')  setLightboxIdx(i => (i !== null && i > 0 ? i - 1 : i))
      if (e.key === 'ArrowRight') setLightboxIdx(i => (i !== null && i < images.length - 1 ? i + 1 : i))
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, images.length])

  return (
    <>
      <style>{`
        .gallery-section {
          width: 100%;
          height: 80vh;
          display: grid;
          gap: 4px;
          background: rgb(230,228,224);
        }
        .gallery-col {
          position: relative;
          overflow: hidden;
          cursor: zoom-in;
          background: rgb(220,218,214);
          border: none; padding: 0; display: block;
        }
        .gallery-col:hover::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.08);
          pointer-events: none;
        }
        .lightbox-backdrop {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(0,0,0,0.92);
          display: flex; align-items: center; justify-content: center;
          cursor: zoom-out;
        }
        .lightbox-img { max-width: 90vw; max-height: 90vh; position: relative; }
        .lightbox-close {
          position: fixed; top: 20px; right: 24px;
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.8); font-size: 32px; line-height: 1;
          transition: color 150ms;
        }
        .lightbox-close:hover { color: rgb(255,255,255); }
        .lightbox-nav {
          position: fixed; top: 50%; transform: translateY(-50%);
          background: rgba(255,255,255,0.1); border: none; cursor: pointer;
          color: rgb(255,255,255); width: 48px; height: 80px;
          display: flex; align-items: center; justify-content: center;
          font-size: 24px; transition: background 150ms; border-radius: 3px;
        }
        .lightbox-nav:hover { background: rgba(255,255,255,0.2); }
        .lightbox-nav.prev { left: 16px; }
        .lightbox-nav.next { right: 16px; }
      `}</style>

      <div
        className="gallery-section"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {images.slice(0, cols).map((img, i) => (
          <button
            key={i}
            className="gallery-col"
            onClick={() => setLightboxIdx(i)}
            aria-label={`Mareste imaginea ${i + 2} pentru ${productName}`}
          >
            <Image
              src={img}
              alt={`${productName} — imagine ${i + 2}`}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              style={{ objectFit: 'cover' }}
              unoptimized={!img.includes(OPTIMIZED_HOST)}
            />
          </button>
        ))}
      </div>

      {open && (
        <div className="lightbox-backdrop" onClick={() => setLightboxIdx(null)} role="dialog" aria-modal="true" aria-label={`Galerie ${productName}`}>
          <button ref={closeRef} className="lightbox-close" onClick={() => setLightboxIdx(null)} aria-label="Inchide galeria">×</button>

          {lightboxIdx! > 0 && (
            <button
              className="lightbox-nav prev"
              onClick={e => { e.stopPropagation(); setLightboxIdx(i => i! - 1) }}
              aria-label="Imaginea anterioara"
            >‹</button>
          )}

          <div
            className="lightbox-img"
            onClick={e => e.stopPropagation()}
            style={{ width: 'min(90vw, 1200px)', height: 'min(90vh, 800px)', position: 'relative' }}
          >
            <Image
              src={images[lightboxIdx!]}
              alt={`${productName} — imagine marita`}
              fill
              sizes="90vw"
              style={{ objectFit: 'contain' }}
              unoptimized={!images[lightboxIdx!].includes(OPTIMIZED_HOST)}
            />
          </div>

          {lightboxIdx! < images.length - 1 && (
            <button
              className="lightbox-nav next"
              onClick={e => { e.stopPropagation(); setLightboxIdx(i => i! + 1) }}
              aria-label="Imaginea urmatoare"
            >›</button>
          )}
        </div>
      )}
    </>
  )
}
