import Nav from '@/components/Nav'
import { getProductBySlug } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const revalidate = 3600
export const dynamicParams = true

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const img = product.main_image_storage_url || product.main_image_url

  const specs = [
    { label: product.st1_label, value: product.st1_value, detail: product.st1_details },
    { label: product.st2_label, value: product.st2_value, detail: product.st2_details },
    { label: product.st3_label, value: product.st3_value, detail: product.st3_details },
  ].filter(s => s.label && s.value)

  const caracteristici = [
    { title: product.c1_title, detail: product.c1_details },
    { title: product.c2_title, detail: product.c2_details },
    { title: product.c3_title, detail: product.c3_details },
  ].filter(c => c.title)

  const aplicatii = [
    { title: product.app_01_title, detail: product.app_01_details },
    { title: product.app_02_title, detail: product.app_02_details },
    { title: product.app_03_title, detail: product.app_03_details },
  ].filter(a => a.title)

  const gallery = [
    product.gallery_storage_url_1 ?? product.gallery_url_1,
    product.gallery_storage_url_2 ?? product.gallery_url_2,
    product.gallery_storage_url_3 ?? product.gallery_url_3,
    product.gallery_storage_url_4 ?? product.gallery_url_4,
  ].filter(Boolean) as string[]

  const breadcrumbs = [
    { href: '/produse', label: 'Catalog' },
    product.category_text ? { href: `/produse?categorie=${encodeURIComponent(product.category_text)}`, label: product.category_text } : null,
    product.subcategory_text ? { href: `/produse?categorie=${encodeURIComponent(product.category_text ?? '')}`, label: product.subcategory_text } : null,
  ].filter(Boolean) as { href: string; label: string }[]

  const displayName = product.sku ?? product.slug

  return (
    <>
      <Nav />
      <style>{`
        .bc-pill {
          font-size: 12px; color: #888; text-decoration: none;
          padding: 5px 12px; border: 1px solid #e0ddd9;
          border-radius: 999px; background: #fff; transition: border-color 150ms;
          white-space: nowrap;
        }
        .bc-pill:hover { border-color: #111; color: #111; }
        .cere-btn {
          display: block; width: 100%; padding: 14px;
          background: #e63022; color: #fff; border: none;
          border-radius: 8px; font-size: 12px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          text-align: center; cursor: pointer; text-decoration: none;
          transition: background 150ms;
        }
        .cere-btn:hover { background: #cc2519; }
        .info-card {
          background: #fff; border: 1px solid #e8e6e2;
          border-radius: 12px; padding: 28px 24px;
          display: flex; flex-direction: column; gap: 6px;
        }
        .info-card-num {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px; color: #aaa; letter-spacing: 0.04em;
        }
        .info-card-title {
          font-size: 18px; font-weight: 700; color: #111;
          letter-spacing: -0.02em; line-height: 1.2;
        }
        .info-card-body {
          font-size: 13px; color: #666; line-height: 1.6;
          margin-top: 4px;
        }
        .section-label {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #888; margin-bottom: 24px;
        }
        .spec-card-pdp {
          background: #fff; border: 1px solid #e8e6e2;
          border-radius: 10px; padding: 24px;
        }
        .thumb { cursor: pointer; border: 1px solid #e0ddd9; border-radius: 6px; overflow: hidden; }
        .thumb:hover { outline: 2px solid #e63022; outline-offset: 2px; }
        .cta-banner {
          background: #1a1a1a; border-radius: 12px;
          padding: 32px 40px;
          display: flex; justify-content: space-between; align-items: center;
          gap: 24px;
        }
        .cta-banner-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 12px 20px; background: #e63022; color: #fff;
          border-radius: 6px; font-size: 12px; font-weight: 700;
          letter-spacing: 0.06em; text-transform: uppercase;
          text-decoration: none; white-space: nowrap; transition: background 150ms;
        }
        .cta-banner-primary:hover { background: #cc2519; }
        .cta-banner-secondary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 12px 20px;
          border: 1px solid rgba(255,255,255,0.2); color: #fff;
          border-radius: 6px; font-size: 12px; font-weight: 600;
          letter-spacing: 0.06em; text-transform: uppercase;
          text-decoration: none; white-space: nowrap;
          transition: border-color 150ms;
        }
        .cta-banner-secondary:hover { border-color: rgba(255,255,255,0.5); }
        .footer-link { font-size: 13px; color: #888; text-decoration: none; display: block; margin-bottom: 8px; }
        .footer-link:hover { color: #111; }
      `}</style>

      <div style={{ paddingTop: '48px', background: "rgb(244,244,244)", minHeight: '100vh' }}>

        {/* ── WHITE TOP SECTION ── */}
        <div style={{ background: 'rgb(255,255,255)', borderBottom: '1px solid #e0ddd9' }}>
          <div style={{
            maxWidth: '1280px', margin: '0 auto',
            padding: '40px 48px 60px',
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: '80px', alignItems: 'start',
          }}>
            {/* LEFT */}
            <div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '40px' }}>
                {breadcrumbs.map((b, i) => (
                  <Link key={i} href={b.href} className="bc-pill">{b.label}</Link>
                ))}
              </div>

              <p style={{ fontSize: '20px', fontWeight: 600, color: 'rgb(0,0,0)', marginBottom: '4px', letterSpacing: '-0.01em' }}>
                {product.brand_name}
              </p>
              <h1 style={{
                fontFamily: "'Bungee', sans-serif",
                fontWeight: 800, fontSize: '44px', textTransform: 'uppercase',
                letterSpacing: '-0.01em', lineHeight: 1, color: 'rgb(0,0,0)', marginBottom: '12px',
              }}>
                {displayName}
              </h1>
              {product.short_description && (
                <p style={{ fontSize: '14px', color: 'rgba(0,0,0,0.5)', lineHeight: 1.6, marginBottom: '32px' }}>
                  {product.short_description}
                </p>
              )}

              {/* SKU field */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: '#f5f3f0', border: '1px solid #e0ddd9',
                borderRadius: '8px', padding: '12px 16px', marginBottom: '16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'rgba(0,0,0,0.3)', fontFamily: 'IBM Plex Mono, monospace', letterSpacing: '0.06em', textTransform: 'uppercase' }}>SKU:</span>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: 'rgb(0,0,0)', fontFamily: 'IBM Plex Mono, monospace' }}>
                    {product.sku ?? product.slug}
                  </span>
                </div>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(0,0,0,0.3)', padding: '4px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                  </svg>
                </button>
              </div>

              <Link href="/contact" className="cere-btn">CERE OFERTA</Link>
            </div>

            {/* RIGHT: image */}
            <div>
              <div style={{ position: 'relative', aspectRatio: '1', background: '#faf9f7', borderRadius: '4px', overflow: 'hidden' }}>
                {img ? (
                  <Image src={img} alt={product.name} fill style={{ objectFit: 'contain', padding: '32px' }} unoptimized />
                ) : (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontFamily: 'IBM Plex Mono, monospace', fontSize: '12px' }}>NO IMAGE</div>
                )}
              </div>
              {gallery.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  {gallery.slice(0, 4).map((url, i) => (
                    <div key={i} className="thumb" style={{ width: '72px', height: '72px', position: 'relative', background: '#faf9f7', flexShrink: 0 }}>
                      <Image src={url} alt={`img ${i+2}`} fill style={{ objectFit: 'contain', padding: '8px' }} unoptimized />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── DARK SPECS SECTION ── */}
        {specs.length > 0 && (
          <div style={{ background: 'rgb(30,30,30)' }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '60px 48px' }}>
              <p className="section-label" style={{ color: 'rgba(255,255,255,0.4)' }}>Specificatii tehnice</p>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(specs.length, 3)}, 1fr)`, gap: '16px' }}>
                {specs.map((spec, i) => (
                  <div key={i} className="spec-card-pdp">
                    <p style={{ fontSize: '12px', color: 'rgba(0,0,0,0.4)', marginBottom: '8px' }}>{spec.label}</p>
                    <p style={{
                      fontFamily: "'Bungee', sans-serif",
                      fontWeight: 800, fontSize: '32px', textTransform: 'uppercase',
                      letterSpacing: '-0.01em', color: 'rgb(0,0,0)', lineHeight: 1, marginBottom: '6px',
                    }}>{spec.value}</p>
                    {spec.detail && <p style={{ fontSize: '13px', color: 'rgba(0,0,0,0.5)', lineHeight: 1.5 }}>{spec.detail}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── FULL-WIDTH IMAGE BAND ── */}
        {img && (
          <div style={{ width: '100%', height: '80vh', position: 'relative', overflow: 'hidden', background: 'rgb(210,208,204)' }}>
            <Image src={img} alt={product.name} fill style={{ objectFit: 'cover', objectPosition: 'center' }} unoptimized />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)' }} />
          </div>
        )}

        {/* ── CARACTERISTICI ── */}
        {caracteristici.length > 0 && (
          <div style={{ background: "rgb(244,244,244)" }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '80px 48px' }}>
              <p className="section-label">Caracteristici</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {caracteristici.map((c, i) => (
                  <div key={i} className="info-card">
                    <span className="info-card-num">0{i + 1}</span>
                    <span className="info-card-title">{c.title}</span>
                    {c.detail && <span className="info-card-body">{c.detail}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── APLICATII RECOMANDATE ── */}
        {aplicatii.length > 0 && (
          <div style={{ background: "rgb(244,244,244)", borderTop: '1px solid #e0ddd9' }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '80px 48px' }}>
              <p className="section-label">Aplicatii recomandate</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {aplicatii.map((a, i) => (
                  <div key={i} className="info-card">
                    <span className="info-card-num">0{i + 1}</span>
                    <span className="info-card-title">{a.title}</span>
                    {a.detail && <span className="info-card-body">{a.detail}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── CTA BANNER ── */}
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 48px 80px' }}>
          <div className="cta-banner">
            <div>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px', letterSpacing: '0.02em' }}>
                Cere o oferta personalizata
              </p>
              <p style={{
                fontFamily: "'Bungee', sans-serif",
                fontWeight: 800, fontSize: '28px', textTransform: 'uppercase',
                color: '#fff', letterSpacing: '-0.01em', lineHeight: 1,
              }}>
                {product.brand_name} {product.sku ?? product.slug}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
              <Link href="/contact" className="cta-banner-primary">
                CERE OFERTA PERSONALIZATA ↗
              </Link>
              <a href="tel:0765432111" className="cta-banner-secondary">
                📞 SAU SUNA LA 0765 432 111
              </a>
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <footer style={{ borderTop: '1px solid #e0ddd9', background: "rgb(244,244,244)" }}>
          <div style={{ borderBottom: '1px solid #e0ddd9', padding: '20px 48px', display: 'flex', gap: '48px', justifyContent: 'center' }}>
            {['Facebook', 'Instagram', 'YouTube', 'Email', 'Telefon'].map(s => (
              <a key={s} href="#" style={{ color: 'rgba(0,0,0,0.4)', fontSize: '12px', textDecoration: 'none', fontWeight: 500 }}>{s}</a>
            ))}
          </div>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '48px' }}>
            <p style={{ fontSize: '13px', color: 'rgba(0,0,0,0.5)', lineHeight: 1.7, maxWidth: '320px' }}>
              Technology Production SRL (Zona Scule) este distribuitor autorizat de scule profesionale cu peste 26 de ani de experiență în România.
            </p>
            <div>
              <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgb(0,0,0)', marginBottom: '16px' }}>INFORMATII</p>
              {['Termene si conditii', 'Politica de retur', 'Achizitii S.E.A.P.', 'ANPC SAL'].map(l => (
                <a key={l} href="#" className="footer-link">{l}</a>
              ))}
            </div>
            <div>
              <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgb(0,0,0)', marginBottom: '16px' }}>CONTACT</p>
              <p style={{ fontSize: '13px', color: '#444', marginBottom: '6px' }}>0248.222.298</p>
              <p style={{ fontSize: '13px', color: '#444', marginBottom: '6px' }}>contact@zonascule.ro</p>
              <p style={{ fontSize: '13px', color: '#444', marginBottom: '6px' }}>Sfanta Vineri 28, Pitesti</p>
              <p style={{ fontSize: '11px', color: 'rgba(0,0,0,0.3)', fontFamily: 'IBM Plex Mono, monospace' }}>CIF / VAT: RO 6796092</p>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #e0ddd9', padding: '16px 48px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', color: 'rgba(0,0,0,0.3)' }}>ZONA SCULE : Technology Promotion SRL</span>
            <a href="https://x.com/silviux" style={{ fontSize: '11px', color: 'rgb(217,44,43)', textDecoration: 'none' }}>silviuX</a>
            <span style={{ fontSize: '11px', color: 'rgba(0,0,0,0.3)' }}>2026</span>
          </div>
        </footer>
      </div>
    </>
  )
}
