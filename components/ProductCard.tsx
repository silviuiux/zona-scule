import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/lib/supabase'

export default function ProductCard({ product }: { product: Product }) {
  const img = product.main_image_storage_url || product.main_image_url
  const hoverImg = product.gallery_url_1 || null

  // Default specs (always shown, faded on hover when alt exists)
  const specs = [
    { label: product.st1_label, value: product.st1_value },
    { label: product.st2_label, value: product.st2_value },
  ].filter(s => s.label && s.value)

  // Alt specs shown on hover (app_01 title + details)
  const altSpec = (product.app_01_title && product.app_01_details)
    ? { label: product.app_01_title, value: product.app_01_details }
    : null

  const hasHoverImg = !!hoverImg   // second image present → cross-fade on hover
  const hasAltSpec = !!altSpec     // alt spec present → spec swap on hover

  // CSS class flags
  const linkClass = [
    'pcard-link',
    hasHoverImg ? 'has-img-alt' : 'no-img-alt',  // controls image behaviour
    hasAltSpec  ? 'has-spec-alt' : '',            // controls spec behaviour
  ].filter(Boolean).join(' ')

  return (
    <Link href={`/produse/${product.slug}`} className={linkClass}>
      <div className="pcard">
        {/* Image area */}
        <div className="pcard-img">
          {img ? (
            <Image
              src={img} alt={product.name} fill
              sizes="(max-width: 640px) 50vw, 280px"
              style={{ objectFit: 'contain', padding: '16px' }}
              unoptimized
              className="pcard-img-main"
            />
          ) : (
            <span style={{
              position: 'absolute', inset: 0, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              color: 'rgba(0,0,0,0.2)', fontSize: '11px',
              fontFamily: 'Recursive, sans-serif',
            }}>NO IMG</span>
          )}
          {hoverImg && (
            <Image
              src={hoverImg} alt={product.name} fill
              sizes="(max-width: 640px) 50vw, 280px"
              style={{ objectFit: 'contain', padding: '16px' }}
              unoptimized
              className="pcard-img-alt"
            />
          )}
        </div>

        {/* Info */}
        <div className="pcard-info">
          {product.brand_name && (
            <p className="pcard-brand">{product.brand_name}</p>
          )}
          <p className="pcard-model">{product.model ?? product.short_description ?? product.name}</p>

          {(specs.length > 0 || altSpec) && (
            <div className="pcard-specs-wrap">
              {specs.length > 0 && (
                <div className={`pcard-specs pcard-specs-default${altSpec ? ' swappable' : ''}`}>
                  {specs.map((s, i) => (
                    <div key={i} className="pcard-spec">
                      <span className="pcard-spec-label">{s.label}</span>
                      <span className="pcard-spec-value">{s.value}</span>
                    </div>
                  ))}
                </div>
              )}
              {altSpec && (
                <div className="pcard-specs pcard-specs-alt">
                  <div className="pcard-spec">
                    <span className="pcard-spec-label">{altSpec.label}</span>
                    <span className="pcard-spec-value">{altSpec.value}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <style>{`
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
        .pcard-link:hover .pcard {
          box-shadow: 0 4px 20px rgba(0,0,0,0.12);
          transform: translateY(-2px);
        }

        /* ── Image area ── */
        .pcard-img {
          position: relative;
          aspect-ratio: 1;
          background: rgb(255,255,255);
          overflow: clip;
        }

        /* Main image: transitions for both opacity (swap) and scale (zoom) */
        .pcard-img-main {
          transition: opacity 280ms ease, transform 400ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        /* Alt image: hidden by default */
        .pcard-img-alt {
          opacity: 0;
          transition: opacity 280ms ease;
        }

        /* Cards WITH a second image → cross-fade */
        .pcard-link.has-img-alt:hover .pcard-img-main { opacity: 0; }
        .pcard-link.has-img-alt:hover .pcard-img-alt  { opacity: 1; }

        /* Cards WITHOUT a second image → subtle zoom-in on main image */
        .pcard-link.no-img-alt:hover .pcard-img-main { transform: scale(1.06); }

        /* ── Info ── */
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

        /* ── Spec swap ── */
        .pcard-specs-wrap {
          position: relative;
          margin-top: 4px;
        }
        .pcard-specs {
          display: flex; flex-wrap: wrap; gap: 12px;
        }
        .pcard-specs-alt {
          position: absolute;
          top: 0; left: 0;
          opacity: 0;
          transition: opacity 220ms ease;
        }
        .pcard-specs-default.swappable {
          transition: opacity 220ms ease;
        }
        .pcard-link.has-spec-alt:hover .pcard-specs-default.swappable { opacity: 0; }
        .pcard-link.has-spec-alt:hover .pcard-specs-alt { opacity: 1; }

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
