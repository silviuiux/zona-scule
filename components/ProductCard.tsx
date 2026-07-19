import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/lib/supabase'
import { stripMarkdown } from '@/lib/markdown'

export default function ProductCard({ product }: { product: Product }) {
  const img = product.main_image_storage_url || product.main_image_url
  const hoverImg = product.gallery_url_1 || null
  // Match the product detail page's title fallback chain (name -> model -> sku -> slug)
  // so cards don't fall through to showing raw description text when `model` is empty/dirty.
  const title = product.name || product.model || product.sku || product.slug

  // Spec boxes: always st1/st2, static (no hover swap)
  const specs = [
    { label: product.st1_label, value: product.st1_value },
    { label: product.st2_label, value: product.st2_value },
  ].filter(s => s.label && s.value)

  const linkClass = [
    'pcard-link',
    hoverImg ? 'has-img-alt' : 'no-img-alt',
  ].join(' ')

  return (
    <Link href={`/produse/${product.slug}`} className={linkClass}>
      <div className="pcard">
        {/* Image area */}
        <div className="pcard-img">
          {img ? (
            <Image
              src={img} alt={product.name} fill
              sizes="(max-width: 640px) 50vw, 380px"
              style={{ objectFit: 'contain', padding: '16px' }}              className="pcard-img-main"
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
              sizes="(max-width: 640px) 50vw, 380px"
              style={{ objectFit: 'cover' }}              className="pcard-img-alt"
            />
          )}
        </div>

        {/* Info */}
        <div className="pcard-info">
          {(product.brand_name || title) && (
            <p className="pcard-brand">
              {[product.brand_name, title].filter(Boolean).join(' ')}
            </p>
          )}
          {product.short_description && (
            <p className="pcard-desc">
              {stripMarkdown(product.short_description)}
            </p>
          )}

          {specs.length > 0 && (
            <div className="pcard-specs-wrap">
              <div className="pcard-specs">
                {specs.map((s, i) => (
                  <div key={i} className="pcard-spec">
                    <span className="pcard-spec-label">{s.label}</span>
                    <span className="pcard-spec-value">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`
        .pcard-link { text-decoration: none; display: flex; flex-direction: column; height: 100%; min-width: 0; }
        .pcard {
          background: rgb(255, 255, 255);
          border-radius: 8px;
          overflow: hidden;
          display: flex; flex-direction: column;
          flex: 1;
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

        /* Main image: contain + padding for clean product shot */
        .pcard-img-main {
          transition: opacity 280ms ease, transform 400ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        /* Alt image: cover, no padding — fills the whole card top */
        .pcard-img-alt {
          opacity: 0;
          transition: opacity 320ms ease;
        }

        /* Cards WITH a second image → cross-fade to full-bleed cover */
        .pcard-link.has-img-alt:hover .pcard-img-main { opacity: 0; }
        .pcard-link.has-img-alt:hover .pcard-img-alt  { opacity: 1; }

        /* Cards WITHOUT a second image → subtle zoom-in on main image */
        .pcard-link.no-img-alt:hover .pcard-img-main { transform: scale(1.06); }

        /* ── Info ── */
        .pcard-info {
          padding: 16px;
          display: flex; flex-direction: column; gap: 8px;
          flex: 1;
          min-width: 0;
        }
        .pcard-brand {
          font-family: 'Recursive', sans-serif;
          font-weight: 500; font-size: 13px;
          color: rgb(0,0,0); letter-spacing: -0.02em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .pcard-desc {
          font-family: 'Recursive', sans-serif;
          font-size: 13px; color: rgba(0,0,0,0.5);
          line-height: 1.4;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* ── Spec boxes (st1/st2) — static, no hover swap ── */
        .pcard-specs-wrap {
          margin-top: auto;
          padding-top: 4px;
        }
        .pcard-specs {
          display: flex; gap: 6px;
        }

        /* Fill-container: each spec box grows to share the row equally —
           full width alone, 50/50 when there are two — and never wraps to
           a second row. min-width: 0 is required alongside flex-grow for
           the label/value ellipsis truncation below to actually kick in. */
        .pcard-spec {
          display: flex; flex-direction: column; gap: 2px;
          flex: 1 1 0; min-width: 0;
          background: rgb(255, 255, 255);
          border: 1px solid rgba(0,0,0,0.14);
          border-radius: 4px;
          padding: 8px 10px;
        }

        .pcard-spec-label {
          display: block;
          font-family: 'Inter', sans-serif;
          font-size: 9px; font-weight: 600;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: rgba(0,0,0,0.4);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .pcard-spec-value {
          display: block;
          font-family: 'Recursive', sans-serif;
          font-size: 13px; font-weight: 500;
          color: rgb(0,0,0); letter-spacing: -0.02em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
    </Link>
  )
}
