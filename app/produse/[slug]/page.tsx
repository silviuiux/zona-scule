import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { getProductBySlug, getAdjacentProducts } from '@/lib/supabase'
import { isAdmin } from '@/lib/adminAuth'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import GallerySection from './GallerySection'
import HeroImage from './HeroImage'
import EditableBreadcrumb from './EditableBreadcrumb'
import ProductNavArrows from './ProductNavArrows'
import SkuCopyField from './SkuCopyField'
import ScrollAnimations from './ScrollAnimations'
import VariationPills from './VariationPills'

export const revalidate = 3600
export const dynamicParams = true

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: 'Produs negasit — Zona Scule' }

  const title = [product.brand_name, product.model ?? product.sku].filter(Boolean).join(' ')
  const description = product.short_description
    ?? `${title} — scule profesionale la Zona Scule, distribuitor autorizat.`
  const img = product.main_image_storage_url || product.main_image_url

  return {
    title: `${title} — Zona Scule`,
    description: description.slice(0, 160),
    openGraph: {
      title: `${title} — Zona Scule`,
      description: description.slice(0, 160),
      images: img ? [{ url: img }] : undefined,
    },
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const [adjacent, admin] = await Promise.all([
    getAdjacentProducts(slug, product.subcategory_text ?? undefined).catch(() => ({ prevSlug: null, nextSlug: null })),
    isAdmin(),
  ])
  const { prevSlug, nextSlug } = adjacent

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

  // Public breadcrumbs (the editable version is admin-only)
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

  const contactHref = `/contact?sku=${encodeURIComponent(product.sku ?? '')}&brand=${encodeURIComponent(product.brand_name ?? '')}&model=${encodeURIComponent(product.model ?? product.sku ?? '')}`

  return (
    <>
      <Nav />
      <style>{`
        .pdp { padding-top: 52px; background: rgb(244,244,244); }

        /* ── TOP WHITE SECTION ── */
        .pdp-top {
          background: rgb(255,255,255);
          border-bottom: 1px solid rgba(0,0,0,0.06);
        }
        .pdp-top-inner {
          max-width: 1440px; margin: 0 auto;
          padding: 40px 12px 60px;
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }

        .bc-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 32px; align-items: center; }
        .bc-pill {
          font-family: var(--font-recursive), sans-serif;
          font-size: 12px; color: rgba(0,0,0,0.62);
          padding: 4px 12px;
          border: 1px solid rgba(0,0,0,0.12);
          border-radius: 4px;
          text-decoration: none;
          transition: border-color 150ms, color 150ms;
          white-space: nowrap;
        }
        .bc-pill:hover { border-color: rgb(0,0,0); color: rgb(0,0,0); }
        .bc-sep { color: rgba(0,0,0,0.25); font-size: 12px; }
        .bc-current { font-family: var(--font-recursive), sans-serif; font-size: 12px; color: rgb(0,0,0); padding: 4px 0; }

        .pdp-brand {
          font-family: var(--font-recursive), sans-serif;
          font-weight: 500; font-size: 18px; color: rgb(0,0,0);
          margin-bottom: 4px; letter-spacing: -0.02em;
          text-decoration: none; display: inline-block;
        }
        .pdp-brand:hover { text-decoration: underline; }
        .pdp-sku {
          font-family: var(--font-bungee), sans-serif;
          font-size: clamp(28px, 3.5vw, 44px);
          color: rgb(0,0,0); line-height: 1;
          text-transform: uppercase; margin-bottom: 12px;
        }
        .pdp-desc {
          font-family: var(--font-recursive), sans-serif;
          font-size: 14px; color: rgba(0,0,0,0.62);
          line-height: 1.65; margin-bottom: 28px;
        }
        .cere-btn {
          display: block; width: 100%; padding: 14px;
          background: rgb(217,44,43); color: rgb(255,255,255); border: none;
          border-radius: 3px; font-family: var(--font-inter), sans-serif;
          font-size: 12px; font-weight: 700; letter-spacing: 0.08em;
          text-transform: uppercase; text-align: center;
          text-decoration: none; cursor: pointer; transition: background 150ms;
        }
        .cere-btn:hover { background: rgb(190,35,34); }

        /* ── DARK SPECS ── */
        .pdp-specs { background: rgb(30,30,30); }
        .pdp-specs-inner {
          max-width: 1440px; margin: 0 auto; padding: 96px 12px;
        }
        .specs-label {
          font-family: var(--font-inter), sans-serif;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: rgba(255,255,255,0.55); margin-bottom: 28px;
        }
        .specs-grid { display: grid; gap: 16px; }
        .spec-card {
          background: rgb(255,255,255); border-radius: 4px;
          padding: 96px 24px 32px;
        }
        .spec-card-label {
          font-family: var(--font-recursive), sans-serif;
          font-size: 12px; color: rgba(0,0,0,0.55); margin-bottom: 6px;
        }
        .spec-card-value {
          font-family: var(--font-bungee), sans-serif;
          font-size: 28px; text-transform: uppercase;
          letter-spacing: -0.01em; color: rgb(0,0,0);
          line-height: 1; margin-bottom: 6px;
        }
        .spec-card-detail {
          font-family: var(--font-recursive), sans-serif;
          font-size: 13px; color: rgba(0,0,0,0.55); line-height: 1.5;
        }

        /* ── INFO CARDS ── */
        .info-section {
          max-width: 1440px; margin: 0 auto; padding: 96px 12px;
        }
        .info-section-label {
          font-family: var(--font-inter), sans-serif;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: rgba(0,0,0,0.5); margin-bottom: 24px;
        }
        .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .info-card {
          background: rgb(255,255,255); border: 1px solid rgba(0,0,0,0.06);
          border-radius: 4px; padding: 96px 24px 32px;
          display: flex; flex-direction: column; gap: 6px;
        }
        .info-num {
          font-family: var(--font-inter), sans-serif;
          font-size: 11px; color: rgba(0,0,0,0.45); font-weight: 500;
        }
        .info-title {
          font-family: var(--font-recursive), sans-serif;
          font-size: 17px; font-weight: 500;
          color: rgb(0,0,0); letter-spacing: -0.02em; line-height: 1.25;
        }
        .info-body {
          font-family: var(--font-recursive), sans-serif;
          font-size: 13px; color: rgba(0,0,0,0.6); line-height: 1.6;
        }

        /* ── CTA BANNER ── */
        .cta-banner { max-width: 1440px; margin: 0 auto; padding: 0 12px 72px; }
        .cta-banner-inner {
          background: rgb(30,30,30); border-radius: 4px;
          padding: 32px 40px;
          display: flex; justify-content: space-between; align-items: center; gap: 24px;
        }
        .cta-banner-eyebrow {
          font-family: var(--font-recursive), sans-serif;
          font-size: 12px; color: rgba(255,255,255,0.55); margin-bottom: 4px;
        }
        .cta-banner-title {
          font-family: var(--font-bungee), sans-serif;
          font-size: 24px; text-transform: uppercase;
          color: rgb(255,255,255); line-height: 1; letter-spacing: -0.01em;
        }
        .cta-banner-btns { display: flex; gap: 10px; flex-shrink: 0; }
        .cta-primary {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 11px 20px; background: rgb(217,44,43); color: rgb(255,255,255);
          border-radius: 3px; font-family: var(--font-inter), sans-serif;
          font-size: 11px; font-weight: 700; letter-spacing: 0.07em;
          text-transform: uppercase; text-decoration: none; white-space: nowrap;
          transition: background 150ms;
        }
        .cta-primary:hover { background: rgb(190,35,34); }
        .cta-secondary {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 11px 20px;
          border: 1px solid rgba(255,255,255,0.3); color: rgb(255,255,255);
          border-radius: 3px; font-family: var(--font-inter), sans-serif;
          font-size: 11px; font-weight: 600; letter-spacing: 0.07em;
          text-transform: uppercase; text-decoration: none; white-space: nowrap;
          transition: border-color 150ms;
        }
        .cta-secondary:hover { border-color: rgba(255,255,255,0.6); }

        /* ── VARIATION PILLS ── */
        .var-pills-wrap { margin-bottom: 24px; }
        .var-pills-label {
          font-family: var(--font-inter), sans-serif;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: rgba(0,0,0,0.5); margin-bottom: 10px;
        }
        .var-pills-row { display: flex; flex-wrap: wrap; gap: 8px; }
        .var-pill {
          display: inline-flex; align-items: center;
          padding: 6px 16px; border-radius: 999px;
          font-family: var(--font-recursive), sans-serif;
          font-size: 13px; white-space: nowrap;
          transition: border-color 150ms, color 150ms, background 150ms;
          text-decoration: none;
        }
        .var-pill-active {
          background: rgb(0,0,0); color: rgb(255,255,255);
          border: 1px solid rgb(0,0,0);
          font-weight: 600; cursor: default;
        }
        .var-pill-link {
          background: transparent; color: rgba(0,0,0,0.65);
          border: 1px solid rgba(0,0,0,0.18); font-weight: 400;
        }
        .var-pill-link:hover { border-color: rgb(0,0,0); color: rgb(0,0,0); }
        .var-pill-disabled {
          background: transparent; color: rgba(0,0,0,0.3);
          border: 1px solid rgba(0,0,0,0.08); font-weight: 400;
          cursor: not-allowed;
        }

        /* ══ SCROLL ANIMATIONS ══ */
        .reveal {
          opacity: 0;
          transform: translateY(20px);
          transition:
            opacity  660ms cubic-bezier(0.16, 1, 0.3, 1),
            transform 660ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal.in-view { opacity: 1; transform: none; }

        .reveal-scale {
          opacity: 0;
          transform: translateY(26px) scale(0.965);
          transition:
            opacity  580ms cubic-bezier(0.16, 1, 0.3, 1),
            transform 580ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal-scale.in-view { opacity: 1; transform: none; }

        /* Content must never stay hidden: reduced-motion users and no-JS
           visitors (incl. search engine renders that skip JS) see everything. */
        @media (prefers-reduced-motion: reduce) {
          .reveal, .reveal-scale { opacity: 1; transform: none; transition: none; }
        }

        .pdp-img-col {
          overflow: hidden;
          will-change: transform;
          margin-bottom: -30px;
          padding-bottom: 30px;
        }
        .reveal.in-view, .reveal-scale.in-view { will-change: auto; }

        /* ══ RESPONSIVE ══ */
        @media (max-width: 768px) {
          .pdp-top-inner {
            grid-template-columns: 1fr !important;
            gap: 32px; padding: 32px 16px 40px;
          }
          .pdp-top-inner > :last-child { order: -1; }
          .pdp-sku { font-size: clamp(24px, 7vw, 44px); }
          .specs-grid {
            display: flex !important;
            overflow-x: auto; gap: 10px; padding-bottom: 8px;
          }
          .spec-card { min-width: 220px; padding: 40px 20px 24px; }
          .pdp-specs-inner { padding: 48px 16px; }
          .info-grid { grid-template-columns: 1fr !important; }
          .info-section { padding: 48px 16px; }
          .cta-banner-inner {
            flex-direction: column; align-items: flex-start;
            padding: 24px 20px; gap: 16px;
          }
          .cta-banner-btns { flex-direction: column; width: 100%; }
          .cta-primary, .cta-secondary { text-align: center; justify-content: center; }
        }
      `}</style>
      <noscript>
        <style>{`.reveal, .reveal-scale { opacity: 1 !important; transform: none !important; }`}</style>
      </noscript>

      <ProductNavArrows prevSlug={prevSlug} nextSlug={nextSlug} />
      <ScrollAnimations />

      <main className="pdp" id="continut">

        {/* ── TOP: info left + hero image right ── */}
        <div className="pdp-top">
          <div className="pdp-top-inner">

            <div>
              <div className="reveal" style={{ transitionDelay: '0ms' }}>
                {admin ? (
                  <EditableBreadcrumb
                    productId={product.id}
                    categoryText={product.category_text}
                    subcategoryText={product.subcategory_text}
                  />
                ) : (
                  <nav className="bc-row" aria-label="Navigare categorii">
                    {breadcrumbs.map((bc, i) => (
                      <span key={bc.href} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        {i > 0 && <span className="bc-sep" aria-hidden="true">/</span>}
                        <Link href={bc.href} className="bc-pill">{bc.label}</Link>
                      </span>
                    ))}
                  </nav>
                )}
              </div>
              <Link
                href={`/produse?brand=${encodeURIComponent(product.brand_name ?? '')}`}
                className="pdp-brand reveal"
                style={{ transitionDelay: '80ms' }}
              >
                {product.brand_name}
              </Link>
              <h1 className="pdp-sku reveal" style={{ transitionDelay: '150ms' }}>
                {product.model || product.sku || product.slug}
              </h1>
              <div className="reveal" style={{ transitionDelay: '210ms' }}>
                <VariationPills
                  variationsJson={product.variations_json}
                  currentSku={product.sku}
                />
              </div>
              {product.short_description && (
                <p className="pdp-desc reveal" style={{ transitionDelay: '270ms' }}>
                  {product.short_description}
                </p>
              )}
              <div className="reveal" style={{ transitionDelay: '330ms' }}>
                <SkuCopyField sku={product.sku ?? product.slug ?? ''} />
              </div>
              <Link href={contactHref} className="cere-btn reveal" style={{ transitionDelay: '390ms' }}>
                CERE OFERTA
              </Link>
            </div>

            {/* RIGHT: parallax hero image */}
            <div className="pdp-img-col">
              <HeroImage src={mainImg} alt={product.name} />
            </div>
          </div>
        </div>

        {/* ── SPECS ── */}
        {specs.length > 0 && (
          <section className="pdp-specs" aria-label="Specificatii tehnice">
            <div className="pdp-specs-inner">
              <p className="specs-label reveal">Specificatii tehnice</p>
              <div className="specs-grid" style={{ gridTemplateColumns: `repeat(${Math.min(specs.length, 3)}, 1fr)` }}>
                {specs.map((s, i) => (
                  <div key={i} className="spec-card reveal-scale">
                    <p className="spec-card-label">{s.label}</p>
                    <p className="spec-card-value">{s.value}</p>
                    {s.detail && <p className="spec-card-detail">{s.detail}</p>}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── GALLERY ── */}
        {galleryImgs.length > 0 && (
          <div className="reveal">
            <GallerySection images={galleryImgs} productName={product.name} />
          </div>
        )}

        {/* ── CARACTERISTICI ── */}
        {caracteristici.length > 0 && (
          <section className="pdp-char-section" style={{ background: 'rgb(244,244,244)', borderTop: '1px solid rgba(0,0,0,0.06)' }} aria-label="Caracteristici">
            <div className="info-section">
              <p className="info-section-label reveal">Caracteristici</p>
              <div className="info-grid" style={{ gridTemplateColumns: `repeat(${Math.min(caracteristici.length, 3)}, 1fr)` }}>
                {caracteristici.map((c, i) => (
                  <div key={i} className="info-card reveal-scale">
                    <span className="info-num">0{i + 1}</span>
                    <span className="info-title">{c.title}</span>
                    {c.detail && <span className="info-body">{c.detail}</span>}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── APLICATII ── */}
        {aplicatii.length > 0 && (
          <section className="pdp-app-section" style={{ background: 'rgb(244,244,244)', borderTop: '1px solid rgba(0,0,0,0.06)' }} aria-label="Aplicatii recomandate">
            <div className="info-section">
              <p className="info-section-label reveal">Aplicatii recomandate</p>
              <div className="info-grid" style={{ gridTemplateColumns: `repeat(${Math.min(aplicatii.length, 3)}, 1fr)` }}>
                {aplicatii.map((a, i) => (
                  <div key={i} className="info-card reveal-scale">
                    <span className="info-num">0{i + 1}</span>
                    <span className="info-title">{a.title}</span>
                    {a.detail && <span className="info-body">{a.detail}</span>}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── CTA BANNER ── */}
        <div className="cta-banner">
          <div className="cta-banner-inner noise-dark reveal-scale">
            <div>
              <p className="cta-banner-eyebrow">Cere o oferta personalizata</p>
              <p className="cta-banner-title">{product.brand_name} {product.sku ?? product.slug}</p>
            </div>
            <div className="cta-banner-btns">
              <Link href={contactHref} className="cta-primary">CERE OFERTA PERSONALIZATA <span aria-hidden="true">↗</span></Link>
              <a href="tel:0248222298" className="cta-secondary">SUNA LA 0248 222 298</a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
