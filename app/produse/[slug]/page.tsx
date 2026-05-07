import Nav from '@/components/Nav'
import { getProductBySlug } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import GallerySection from './GallerySection'
import HeroImage from './HeroImage'

export const revalidate = 3600
export const dynamicParams = true

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const mainImg = product.main_image_storage_url || product.main_image_url

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

  const galleryImgs = [
    product.gallery_storage_url_1 ?? product.gallery_url_1,
    product.gallery_storage_url_2 ?? product.gallery_url_2,
    product.gallery_storage_url_3 ?? product.gallery_url_3,
    product.gallery_storage_url_4 ?? product.gallery_url_4,
  ].filter(Boolean) as string[]

  // Breadcrumbs — #10: radius 4px, links to listing with category/subcategory
  const breadcrumbs = [
    { href: '/produse', label: 'Catalog' },
    product.category_text ? {
      href: `/produse?categorie=${encodeURIComponent(product.category_text)}`,
      label: product.category_text
    } : null,
    product.subcategory_text ? {
      href: `/produse?categorie=${encodeURIComponent(product.category_text ?? '')}&subcategorie=${encodeURIComponent(product.subcategory_text)}`,
      label: product.subcategory_text
    } : null,
  ].filter(Boolean) as { href: string; label: string }[]

  return (
    <>
      <Nav />
      <style>{`
        .pdp { padding-top: 52px; background: rgb(244,244,244); }

        /* ── TOP WHITE SECTION ── */
        /* #4: full white background, no border on image */
        .pdp-top {
          background: rgb(255,255,255);
          border-bottom: 1px solid rgba(0,0,0,0.06);
        }
        .pdp-top-inner {
          max-width: 1440px; margin: 0 auto;
          padding: 40px 12px 60px;
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 80px;
          /* #6: vertically center left content */
          align-items: center;
        }

        /* Left content */
        .bc-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 32px; }
        /* #10: breadcrumb pills with border-radius 4px */
        .bc-pill {
          font-family: 'Recursive', sans-serif;
          font-size: 12px; color: rgba(0,0,0,0.5);
          padding: 4px 12px;
          border: 1px solid rgba(0,0,0,0.1);
          border-radius: 4px;
          text-decoration: none;
          transition: border-color 150ms, color 150ms;
          white-space: nowrap;
        }
        .bc-pill:hover { border-color: rgb(0,0,0); color: rgb(0,0,0); }

        .pdp-brand {
          font-family: 'Recursive', sans-serif;
          font-weight: 500; font-size: 18px; color: rgb(0,0,0);
          margin-bottom: 4px; letter-spacing: -0.02em;
        }
        .pdp-sku {
          font-family: 'Bungee', sans-serif;
          font-size: clamp(28px, 3.5vw, 44px);
          color: rgb(0,0,0); line-height: 1;
          text-transform: uppercase; margin-bottom: 12px;
        }
        .pdp-desc {
          font-family: 'Recursive', sans-serif;
          font-size: 14px; color: rgba(0,0,0,0.5);
          line-height: 1.65; margin-bottom: 28px;
        }
        .sku-field {
          display: flex; align-items: center; justify-content: space-between;
          background: rgb(244,244,244); border: 1px solid rgba(0,0,0,0.08);
          border-radius: 4px; padding: 10px 14px; margin-bottom: 12px;
        }
        .sku-field-label {
          font-family: 'Inter', sans-serif;
          font-size: 10px; font-weight: 600;
          letter-spacing: 0.08em; text-transform: uppercase; color: rgba(0,0,0,0.35);
          margin-right: 8px;
        }
        .sku-field-value {
          font-family: 'Recursive', sans-serif;
          font-size: 13px; font-weight: 500; color: rgb(0,0,0); flex: 1;
        }
        .cere-btn {
          display: block; width: 100%; padding: 14px;
          background: rgb(217,44,43); color: rgb(255,255,255); border: none;
          border-radius: 3px; font-family: 'Inter', sans-serif;
          font-size: 12px; font-weight: 700; letter-spacing: 0.08em;
          text-transform: uppercase; text-align: center;
          text-decoration: none; cursor: pointer; transition: background 150ms;
        }
        .cere-btn:hover { background: rgb(190,35,34); }

        /* ── DARK SPECS — #3: comes right after hero, before gallery ── */
        /* #9: padding 96px top/bottom for sections */
        .pdp-specs { background: rgb(30,30,30); }
        .pdp-specs-inner {
          max-width: 1440px; margin: 0 auto; padding: 96px 12px;
        }
        .specs-label {
          font-family: 'Inter', sans-serif;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: rgba(255,255,255,0.3); margin-bottom: 28px;
        }
        .specs-grid { display: grid; gap: 16px; }
        /* #9: spec cards — 96px top, 32px bottom padding */
        .spec-card {
          background: rgb(255,255,255); border-radius: 4px;
          padding: 96px 24px 32px;
        }
        .spec-card-label {
          font-family: 'Recursive', sans-serif;
          font-size: 12px; color: rgba(0,0,0,0.4); margin-bottom: 6px;
        }
        .spec-card-value {
          font-family: 'Bungee', sans-serif;
          font-size: 28px; text-transform: uppercase;
          letter-spacing: -0.01em; color: rgb(0,0,0);
          line-height: 1; margin-bottom: 6px;
        }
        .spec-card-detail {
          font-family: 'Recursive', sans-serif;
          font-size: 13px; color: rgba(0,0,0,0.5); line-height: 1.5;
        }

        /* ── INFO CARDS ── */
        /* #9: section padding 96px */
        .info-section {
          max-width: 1440px; margin: 0 auto; padding: 96px 12px;
        }
        .info-section-label {
          font-family: 'Inter', sans-serif;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: rgba(0,0,0,0.35); margin-bottom: 24px;
        }
        .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        /* #9: info cards — 96px top, 32px bottom */
        .info-card {
          background: rgb(255,255,255); border: 1px solid rgba(0,0,0,0.06);
          border-radius: 4px; padding: 96px 24px 32px;
          display: flex; flex-direction: column; gap: 6px;
        }
        .info-num {
          font-family: 'Inter', sans-serif;
          font-size: 11px; color: rgba(0,0,0,0.3); font-weight: 500;
        }
        .info-title {
          font-family: 'Recursive', sans-serif;
          font-size: 17px; font-weight: 500;
          color: rgb(0,0,0); letter-spacing: -0.02em; line-height: 1.25;
        }
        .info-body {
          font-family: 'Recursive', sans-serif;
          font-size: 13px; color: rgba(0,0,0,0.5); line-height: 1.6;
        }

        /* ── CTA BANNER ── */
        .cta-banner { max-width: 1440px; margin: 0 auto; padding: 0 12px 72px; }
        .cta-banner-inner {
          background: rgb(30,30,30); border-radius: 4px;
          padding: 32px 40px;
          display: flex; justify-content: space-between; align-items: center; gap: 24px;
        }
        .cta-banner-eyebrow {
          font-family: 'Recursive', sans-serif;
          font-size: 12px; color: rgba(255,255,255,0.4); margin-bottom: 4px;
        }
        .cta-banner-title {
          font-family: 'Bungee', sans-serif;
          font-size: 24px; text-transform: uppercase;
          color: rgb(255,255,255); line-height: 1; letter-spacing: -0.01em;
        }
        .cta-banner-btns { display: flex; gap: 10px; flex-shrink: 0; }
        .cta-primary {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 11px 20px; background: rgb(217,44,43); color: rgb(255,255,255);
          border-radius: 3px; font-family: 'Inter', sans-serif;
          font-size: 11px; font-weight: 700; letter-spacing: 0.07em;
          text-transform: uppercase; text-decoration: none; white-space: nowrap;
          transition: background 150ms;
        }
        .cta-primary:hover { background: rgb(190,35,34); }
        .cta-secondary {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 11px 20px;
          border: 1px solid rgba(255,255,255,0.2); color: rgb(255,255,255);
          border-radius: 3px; font-family: 'Inter', sans-serif;
          font-size: 11px; font-weight: 600; letter-spacing: 0.07em;
          text-transform: uppercase; text-decoration: none; white-space: nowrap;
          transition: border-color 150ms;
        }
        .cta-secondary:hover { border-color: rgba(255,255,255,0.5); }

        /* ── FOOTER ── */
        .footer { background: rgb(244,244,244); border-top: 1px solid rgba(0,0,0,0.08); }
        .footer-social {
          padding: 18px 12px; max-width: 1440px; margin: 0 auto;
          display: flex; gap: 48px; justify-content: center;
          border-bottom: 1px solid rgba(0,0,0,0.08);
        }
        .footer-social a { font-family: 'Inter', sans-serif; font-size: 12px; color: rgba(0,0,0,0.4); text-decoration: none; }
        .footer-social a:hover { color: rgb(0,0,0); }
        .footer-grid {
          max-width: 1440px; margin: 0 auto; padding: 48px 12px;
          display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 48px;
        }
        .footer-col-title {
          font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase; color: rgb(0,0,0); margin-bottom: 14px;
        }
        .footer-link { font-family: 'Recursive', sans-serif; font-size: 13px; color: rgba(0,0,0,0.45); text-decoration: none; display: block; margin-bottom: 8px; }
        .footer-link:hover { color: rgb(0,0,0); }
        .footer-bottom {
          border-top: 1px solid rgba(0,0,0,0.08); padding: 14px 12px;
          max-width: 1440px; margin: 0 auto;
          display: flex; justify-content: space-between; align-items: center;
        }
        .footer-bottom span, .footer-bottom a { font-family: 'Recursive', sans-serif; font-size: 11px; color: rgba(0,0,0,0.3); text-decoration: none; }
        .footer-bottom a { color: rgb(217,44,43); }
      `}</style>

      <div className="pdp">

        {/* ── TOP: info left (centered) + hero image right ── */}
        <div className="pdp-top">
          <div className="pdp-top-inner">

            {/* LEFT — #6: vertically centered via align-items:center on grid */}
            <div>
              <div className="bc-row">
                {breadcrumbs.map((b, i) => (
                  <Link key={i} href={b.href} className="bc-pill">{b.label}</Link>
                ))}
              </div>
              <p className="pdp-brand">{product.brand_name}</p>
              <h1 className="pdp-sku">{product.model || product.sku || product.slug}</h1>
              {product.short_description && (
                <p className="pdp-desc">{product.short_description}</p>
              )}
              <div className="sku-field">
                <span className="sku-field-label">SKU:</span>
                <span className="sku-field-value">{product.sku ?? product.slug}</span>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(0,0,0,0.3)', padding: '2px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                  </svg>
                </button>
              </div>
              <Link href={`/contact?sku=${encodeURIComponent(product.sku ?? '')}&brand=${encodeURIComponent(product.brand_name ?? '')}&model=${encodeURIComponent(product.model ?? product.sku ?? '')}`} className="cere-btn">CERE OFERTA</Link>
            </div>

            {/* RIGHT: #4 no border/box, pure white bg, #5 hover + lightbox */}
            <HeroImage src={mainImg} alt={product.name} />
          </div>
        </div>

        {/* ── #3: SPECS come immediately after hero ── */}
        {specs.length > 0 && (
          <div className="pdp-specs">
            <div className="pdp-specs-inner">
              <p className="specs-label">Specificatii tehnice</p>
              <div className="specs-grid" style={{ gridTemplateColumns: `repeat(${Math.min(specs.length, 3)}, 1fr)` }}>
                {specs.map((s, i) => (
                  <div key={i} className="spec-card">
                    <p className="spec-card-label">{s.label}</p>
                    <p className="spec-card-value">{s.value}</p>
                    {s.detail && <p className="spec-card-detail">{s.detail}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── GALLERY: 80vh split columns — after specs ── */}
        {galleryImgs.length > 0 && (
          <GallerySection images={galleryImgs} productName={product.name} />
        )}

        {/* ── CARACTERISTICI ── */}
        {caracteristici.length > 0 && (
          <div style={{ background: 'rgb(244,244,244)', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
            <div className="info-section">
              <p className="info-section-label">Caracteristici</p>
              <div className="info-grid">
                {caracteristici.map((c, i) => (
                  <div key={i} className="info-card">
                    <span className="info-num">0{i + 1}</span>
                    <span className="info-title">{c.title}</span>
                    {c.detail && <span className="info-body">{c.detail}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── APLICATII ── */}
        {aplicatii.length > 0 && (
          <div style={{ background: 'rgb(244,244,244)', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
            <div className="info-section">
              <p className="info-section-label">Aplicatii recomandate</p>
              <div className="info-grid">
                {aplicatii.map((a, i) => (
                  <div key={i} className="info-card">
                    <span className="info-num">0{i + 1}</span>
                    <span className="info-title">{a.title}</span>
                    {a.detail && <span className="info-body">{a.detail}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── CTA BANNER ── */}
        <div className="cta-banner">
          <div className="cta-banner-inner">
            <div>
              <p className="cta-banner-eyebrow">Cere o oferta personalizata</p>
              <p className="cta-banner-title">{product.brand_name} {product.sku ?? product.slug}</p>
            </div>
            <div className="cta-banner-btns">
              <Link href={`/contact?sku=${encodeURIComponent(product.sku ?? '')}&brand=${encodeURIComponent(product.brand_name ?? '')}&model=${encodeURIComponent(product.model ?? product.sku ?? '')}`} className="cta-primary">CERE OFERTA PERSONALIZATA ↗</Link>
              <a href="tel:0248222298" className="cta-secondary">📞 SAU SUNA LA 0248 222 298</a>
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <footer className="footer">
          <div className="footer-social">
            {['Facebook', 'Instagram', 'YouTube', 'Email', 'Telefon'].map(s => <a key={s} href="#">{s}</a>)}
          </div>
          <div className="footer-grid">
            <p style={{ fontFamily: 'Recursive, sans-serif', fontSize: '13px', color: 'rgba(0,0,0,0.5)', lineHeight: 1.7, maxWidth: '300px' }}>
              Technology Production SRL (Zona Scule) este distribuitor autorizat de scule profesionale cu peste 26 de ani de experiență în România.
            </p>
            <div>
              <p className="footer-col-title">INFORMATII</p>
              {['Termene si conditii','Politica de retur','Achizitii S.E.A.P.','ANPC SAL'].map(l => <a key={l} href="#" className="footer-link">{l}</a>)}
            </div>
            <div>
              <p className="footer-col-title">CONTACT</p>
              <p className="footer-link">0248.222.298</p>
              <p className="footer-link">contact@zonascule.ro</p>
              <p className="footer-link">Sfanta Vineri 28, Pitesti</p>
            </div>
          </div>
          <div className="footer-bottom">
            <span>ZONA SCULE : Technology Promotion SRL</span>
            <a href="https://x.com/silviux">silviuX</a>
            <span>2026</span>
          </div>
        </footer>

      </div>
    </>
  )
}
