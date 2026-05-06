'use client'
import { useState } from 'react'
import Image from 'next/image'

export default function GallerySection({ images, productName }: { images: string[]; productName: string }) {
  const [lightbox, setLightbox] = useState<string | null>(null)

  // Distribute images into 1-3 columns based on count
  const cols = Math.min(images.length, 3)

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
        }
        .gallery-col:hover::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.08);
          pointer-events: none;
        }
        /* Lightbox */
        .lightbox-backdrop {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(0,0,0,0.92);
          display: flex; align-items: center; justify-content: center;
          cursor: zoom-out;
        }
        .lightbox-img {
          max-width: 90vw; max-height: 90vh;
          position: relative;
        }
        .lightbox-close {
          position: fixed; top: 20px; right: 24px;
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.7); font-size: 32px; line-height: 1;
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

      {/* Gallery: split into vertical columns */}
      <div
        className="gallery-section"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {images.slice(0, cols).map((img, i) => (
          <div
            key={i}
            className="gallery-col"
            onClick={() => setLightbox(img)}
          >
            <Image
              src={img}
              alt={`${productName} ${i + 2}`}
              fill
              style={{ objectFit: 'cover' }}
              unoptimized
            />
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="lightbox-backdrop" onClick={() => setLightbox(null)}>
          <button className="lightbox-close" onClick={() => setLightbox(null)}>×</button>

          {/* Prev */}
          {images.indexOf(lightbox) > 0 && (
            <button
              className="lightbox-nav prev"
              onClick={e => { e.stopPropagation(); setLightbox(images[images.indexOf(lightbox!) - 1]) }}
            >
              ‹
            </button>
          )}

          <div
            className="lightbox-img"
            onClick={e => e.stopPropagation()}
            style={{ width: 'min(90vw, 1200px)', height: 'min(90vh, 800px)', position: 'relative' }}
          >
            <Image
              src={lightbox}
              alt={productName}
              fill
              style={{ objectFit: 'contain' }}
              unoptimized
            />
          </div>

          {/* Next */}
          {images.indexOf(lightbox) < images.length - 1 && (
            <button
              className="lightbox-nav next"
              onClick={e => { e.stopPropagation(); setLightbox(images[images.indexOf(lightbox!) + 1]) }}
            >
              ›
            </button>
          )}
        </div>
      )}
    </>
  )
}
