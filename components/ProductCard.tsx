import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/lib/supabase'

/** Deterministic 0..n-1 pick from the product id — stable across renders
 *  (the previous Math.random() produced a different card on every render). */
function pickIndex(id: string, n: number): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return h % n
}

export default function ProductCard({ product }: { product: Product }) {
  const img = product.main_image_storage_url || product.main_image_url
  const hoverImg = product.gallery_url_1 || null

  const specs = [
    { label: product.st1_label, value: product.st1_value },
    { label: product.st2_label, value: product.st2_value },
  ].filter(s => s.label && s.value)

  const availableAppSpecs = [
    product.app_01_title && product.app_01_details
      ? { label: product.app_01_title, value: product.app_01_details } : null,
    product.app_02_title && product.app_02_details
      ? { label: product.app_02_title, value: product.app_02_details } : null,
    product.app_03_title && product.app_03_details
      ? { label: product.app_03_title, value: product.app_03_details } : null,
  ].filter((s): s is { label: string; value: string } => s !== null)

  const altSpec = availableAppSpecs.length > 0
    ? availableAppSpecs[pickIndex(product.id, availableAppSpecs.length)]
    : null

  const linkClass = [
    'pcard-link',
    hoverImg ? 'has-img-alt' : 'no-img-alt',
    altSpec ? 'has-spec-alt' : '',
  ].filter(Boolean).join(' ')

  const displayName = [product.brand_name, product.name || product.model || product.short_description]
    .filter(Boolean).join(' ')

  return (
    <Link href={`/produse/${product.slug}`} className={linkClass} aria-label={displayName}>
      <article className="pcard">
        <div className="pcard-img">
          {img ? (
            <Image
              src={img} alt="" fill
              sizes="(max-width: 640px) 50vw, 380px"
              style={{ objectFit: 'contain', padding: '16px' }}
              unoptimized
              className="pcard-img-main"
            />
          ) : (
            <span style={{
              position: 'absolute', inset: 0, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              color: 'rgba(0,0,0,0.3)', fontSize: '11px',
              fontFamily: 'var(--font-recursive), sans-serif',
            }} aria-hidden="true">FARA IMAGINE</span>
          )}
          {hoverImg && (
            <Image
              src={hoverImg} alt="" fill
              sizes="(max-width: 640px) 50vw, 380px"
              style={{ objectFit: 'cover' }}
              unoptimized
              className="pcard-img-alt"
            />
          )}
        </div>

        <div className="pcard-info">
          {product.brand_name && (
            <p className="pcard-brand">{product.brand_name}</p>
          )}
          <p className="pcard-model">{product.name || product.model || product.short_description}</p>

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
                <div className="pcard-specs pcard-specs-alt" aria-hidden="true">
                  <div className="pcard-spec pcard-spec-wide">
                    <span className="pcard-spec-label">{altSpec.label}</span>
                    <span className="pcard-spec-value pcard-spec-value-clamp">{altSpec.value}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </article>
    </Link>
  )
}
