import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/lib/supabase'

export default function ProductCard({ product }: { product: Product }) {
  const img = product.main_image_storage_url || product.main_image_url
  const specs = [
    { label: product.st1_label, value: product.st1_value },
    { label: product.st2_label, value: product.st2_value },
  ].filter(s => s.label && s.value)

  return (
    <Link href={`/produse/${product.slug}`} className="pcard-link">
      <div className="pcard">
        {/* Image area — matches Framer: white bg, padding 16px, overflow clip */}
        <div className="pcard-img">
          {img ? (
            <Image
              src={img} alt={product.name} fill
              sizes="(max-width: 640px) 50vw, 280px"
              style={{ objectFit: 'contain', padding: '16px' }}
              unoptimized
            />
          ) : (
            <span style={{
              position: 'absolute', inset: 0, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              color: 'rgba(0,0,0,0.2)', fontSize: '11px',
              fontFamily: 'Recursive, sans-serif',
            }}>NO IMG</span>
          )}
        </div>
        {/* Info — matches Framer: 16px padding, gap 8px */}
        <div className="pcard-info">
          {product.brand_name && (
            <p className="pcard-brand">{product.brand_name}</p>
          )}
          <p className="pcard-model">{product.model ?? product.short_description ?? product.name}</p>
          {specs.length > 0 && (
            <div className="pcard-specs">
              {specs.map((s, i) => (
                <div key={i} className="pcard-spec">
                  <span className="pcard-spec-label">{s.label}</span>
                  <span className="pcard-spec-value">{s.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <style>{`
        /* min-width: 0 prevents grid items from expanding past 1fr when an inner
           element (e.g. .pcard-model with white-space: nowrap) has long content. */
        .pcard-link { text-decoration: none; display: block; min-width: 0; }
        .pcard {
          background: rgb(255, 255, 255);
          border-radius: 4px;
          overflow: hidden;
          display: flex; flex-direction: column;
          min-width: 0;
          position: relative;
          isolation: isolate;
          transition: box-shadow 200ms, transform 200ms;
        }
        /* Concrete grain on card surface */
        .pcard::after {
          content: '';
          position: absolute;
          inset: 0;
          z-index: 10;
          pointer-events: none;
          background-image: var(--noise-svg);
          background-repeat: repeat;
          background-size: 200px 200px;
          opacity: 0.22;
          mix-blend-mode: multiply;
        }
        .pcard-link:hover .pcard {
          box-shadow: 0 4px 20px rgba(0,0,0,0.12);
          transform: translateY(-2px);
        }
        .pcard-img {
          position: relative;
          aspect-ratio: 1;
          background: rgb(255,255,255);
          overflow: clip;
        }
        .pcard-info {
          padding: 16px;
          display: flex; flex-direction: column; gap: 8px;
          min-width: 0;
        }
        .pcard-brand {
          font-family: 'Recursive', sans-serif;
          font-weight: 500; font-size: 13px;
          color: rgb(0,0,0); letter-spacing: -0.02em;
        }
        .pcard-model {
          font-family: 'Recursive', sans-serif;
          font-size: 13px; color: rgba(0,0,0,0.5);
          line-height: 1.4;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .pcard-specs {
          display: flex; flex-wrap: wrap; gap: 12px;
          margin-top: 4px;
        }
        .pcard-spec { display: flex; flex-direction: column; gap: 2px; }
        .pcard-spec-label {
          font-family: 'Inter', sans-serif;
          font-size: 9px; font-weight: 600;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: rgba(0,0,0,0.4);
        }
        .pcard-spec-value {
          font-family: 'Recursive', sans-serif;
          font-size: 13px; font-weight: 500;
          color: rgb(0,0,0); letter-spacing: -0.02em;
        }
      `}</style>
    </Link>
  )
}
