import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { getProductBySlug, getAdjacentProducts, getFamilyVariantsFull, getApplicationImages, getRelatedProducts } from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import GallerySection from './GallerySection'
import HeroImage from './HeroImage'
import ProductNavArrows from './ProductNavArrows'
import ShortDescription from '@/components/ShortDescription'
import SkuCopyField from './SkuCopyField'
import VariantSelector from './VariantSelector'
import StickyOfferBar from './StickyOfferBar'
import TrackRecent from './TrackRecent'
import ProductVariantCarousel from '@/components/ProductVariantCarousel'
import StoryMotion from '@/app/zona-solutii/StoryMotion'
import { SOLUTIONS_CSS, STORY_CSS } from '@/app/zona-solutii/styles'
import { editorial, pad, stagger } from '@/app/zona-solutii/editorial'

export const revalidate = 3600
export const dynamicParams = true

/**
 * Product page, in the Zona Soluții story language: a quiet split hero
 * (text left, the product right), then the manufacturer's application
 * photo growing to the whole screen, numbered chapters for the specs, a
 * step sequence for the features, full-bleed photos between them and an
 * offer block to close. A slim offer bar follows once the hero is gone.
 */
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [product, adjacent] = await Promise.all([
    getProductBySlug(slug),
    getAdjacentProducts(slug, undefined).catch(() => ({ prevSlug: null, nextSlug: null })),
  ])
  if (!product) notFound()
  const { prevSlug, nextSlug } = adjacent

  // sibling variants in the same family (empty if no family / single variant)
  // and the "Produse similare" row, fetched together
  const [familyVariants, related] = await Promise.all([
    product.family_id ? getFamilyVariantsFull(product.family_id) : Promise.resolve([]),
    getRelatedProducts(product).catch(() => ({ products: [], total: 0 })),
  ])
  const variants = familyVariants.map(v => ({
    slug: v.slug, sku: v.sku, name: v.name, variant_label: v.variant_label,
    specs: v.specs, ean: v.ean,
  }))

  const mainImg = product.main_image_storage_url || product.main_image_url
  const title = product.name || product.model || product.sku || product.slug
  const model = product.model || product.sku || product.name

  const specs = [
    { label: product.st1_label, value: product.st1_value, detail: product.st1_details },
    { label: product.st2_label, value: product.st2_value, detail: product.st2_details },
    { label: product.st3_label, value: product.st3_value, detail: product.st3_details },
  ].filter(s => s.label && s.value)

  const caracteristici = [
    { title: product.c1_title, text: product.c1_details },
    { title: product.c2_title, text: product.c2_details },
    { title: product.c3_title, text: product.c3_details },
  ].filter(c => c.title).map(c => ({ title: c.title!, text: c.text ?? '' }))

  const aplicatii = [
    { title: product.app_01_title, detail: product.app_01_details },
    { title: product.app_02_title, detail: product.app_02_details },
    { title: product.app_03_title, detail: product.app_03_details },
  ].filter(a => a.title)

  // Gallery: the manufacturer's application photos (Bosch "application"
  // shots, not the tall VERTICAL crops) become the full-bleed photos; the
  // rest stay in the gallery grid.
  const pairs = [1, 2, 3, 4].map(i => {
    const src = product[`gallery_url_${i}` as keyof typeof product] as string | null
    const stored = product[`gallery_storage_url_${i}` as keyof typeof product] as string | null
    return { src, url: stored ?? src }
  }).filter(p => p.url)
  const isApplication = (p: { src: string | null }) => !!p.src && /application/i.test(p.src) && !/VERTICAL/i.test(p.src)
  const ownPhotos = pairs.filter(isApplication).map(p => p.url as string)
  const galleryImgs = pairs.filter(p => !isApplication(p)).map(p => p.url as string)
  // no photos of its own: borrow the atmosphere from its subcategory
  const photos = ownPhotos.length > 0
    ? ownPhotos
    : product.subcategory_text ? await getApplicationImages([product.subcategory_text], 2).catch(() => []) : []
  const ownPhotosShown = ownPhotos.length > 0

  const catalogHref = (params: Record<string, string | null | undefined>) => {
    const q = new URLSearchParams()
    for (const [k, v] of Object.entries(params)) if (v) q.set(k, v)
    return `/produse?${q.toString()}`
  }
  const offerHref = `/contact?sku=${encodeURIComponent(product.sku ?? '')}&brand=${encodeURIComponent(product.brand_name ?? '')}&model=${encodeURIComponent(product.model ?? product.sku ?? '')}`

  const { chapter, sequence, fullBleed, expand } = editorial()

  return (
    <>
      <Nav progress />
      <TrackRecent slug={product.slug} name={title} brand={product.brand_name ?? null} sku={product.sku ?? null} image={mainImg ?? null} />
      <style>{SOLUTIONS_CSS + STORY_CSS + `
        /* ── Hero: text left, the product right, a full first screen ── */
        .pd-hero {
          display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 16px; align-items: center;
          min-height: calc(100vh - var(--nav-h));
          padding: clamp(56px, 9vh, 112px) 0 clamp(72px, 11vh, 128px);
        }
        .pd-copy { grid-column: 1 / span 6; }
        .pd-media { grid-column: 8 / span 5; position: relative; }
        .pd-brand {
          display: inline-flex; align-items: center; gap: 12px; margin-bottom: 28px;
          font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; font-weight: 500;
          letter-spacing: 0.16em; text-transform: uppercase; color: rgb(217,44,43); text-decoration: none;
        }
        .pd-brand::before { content: ''; width: 24px; height: 1px; background: rgb(217,44,43); }
        .pd-brand:hover { text-decoration: underline; text-underline-offset: 4px; }
        .pd-title {
          font-family: 'Neuton', serif; font-weight: 400;
          font-size: clamp(40px, 4.6vw, 76px); line-height: 0.98; letter-spacing: -0.015em;
          color: rgb(0,0,0); margin-bottom: 28px;
        }
        .pd-desc { font-family: 'Recursive', sans-serif; font-size: 16px; line-height: 1.65; color: rgba(0,0,0,0.55); max-width: 560px; margin-bottom: 40px; }
        .pd-desc p { margin: 0 0 10px; }
        .pd-desc p:last-child { margin-bottom: 0; }
        .pd-desc strong { font-weight: 600; color: rgba(0,0,0,0.75); }
        .pd-desc ul { margin: 8px 0 0; padding-left: 18px; list-style: disc; }
        .pd-desc li { margin-bottom: 4px; }
        .pd-hero .zs-stats { margin-bottom: 40px; padding-top: 24px; border-top: 1px solid rgba(0,0,0,0.08); }
        .pd-actions { display: flex; flex-direction: column; gap: 4px; max-width: 460px; }
        .pd-actions .sku-field { margin-bottom: 8px; }
        .pd-offer {
          display: inline-flex; align-items: center; justify-content: center; gap: 12px; height: 52px; margin-top: 8px;
          background: rgb(18,18,18); color: rgb(255,255,255); border-radius: 4px; text-decoration: none;
          font-family: 'Oswald', 'Inter', sans-serif; font-size: 13px; letter-spacing: 0.22em; text-transform: uppercase;
          transition: background 150ms;
        }
        .pd-offer:hover { background: rgb(217,44,43); }
        .pd-media .hero-img-wrap { aspect-ratio: 4 / 5; border-radius: 4px; }
        .pd-media .hero-img-wrap img { padding: 8% !important; }
        .pd-media-cap {
          display: flex; justify-content: space-between; margin-top: 16px;
          font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10.5px; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(0,0,0,0.4);
        }
        .pd-hero .zs-scroll-cue { bottom: clamp(32px, 5vh, 56px); right: auto; left: 0; }
        .pd-hero { position: relative; }

        /* ── Specs: three big numbers ── */
        .pd-specs { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
        .pd-spec { border-top: 1px solid rgba(0,0,0,0.14); padding-top: 28px; }
        .pd-spec-label { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(0,0,0,0.45); margin-bottom: 20px; }
        .pd-spec-value { font-family: 'Neuton', serif; font-size: clamp(48px, 5.6vw, 92px); line-height: 0.95; letter-spacing: -0.02em; color: rgb(0,0,0); margin-bottom: 20px; }
        .pd-spec-detail { font-family: 'Recursive', sans-serif; font-size: 14px; line-height: 1.6; color: rgba(0,0,0,0.55); max-width: 360px; }

        /* ── Gallery: full width, in the page's rhythm ── */
        .pd-gallery { width: 100vw; margin-left: calc(50% - 50vw); }

        /* ── Applications: numbered cards ── */
        .pd-apps .zs-check-item { cursor: default; }
        .pd-apps .zs-check-name { font-family: 'Neuton', serif; font-weight: 400; font-size: 28px; line-height: 1.05; }

        @media (max-width: 1024px) {
          .pd-copy, .pd-media { grid-column: 1 / -1; }
          .pd-media { order: -1; max-width: 520px; }
          .pd-hero { min-height: auto; }
          .pd-hero .zs-scroll-cue { display: none; }
        }
        @media (max-width: 640px) {
          .pd-specs { grid-template-columns: 1fr; gap: 40px; }
          .pd-media .hero-img-wrap { aspect-ratio: 1 / 1; }
          .pd-hero { padding-top: 32px; }
        }
      `}</style>

      <ProductNavArrows prevSlug={prevSlug} nextSlug={nextSlug} />
      <StoryMotion />
      <StickyOfferBar brand={product.brand_name} title={model ?? title} href={offerHref} />

      <main className="zs-page zs-story">
        <div className="zs-wrap">
          <header className="pd-hero" data-offer-watch>
            <div className="pd-copy">
              <nav className="zs-crumbs" aria-label="Breadcrumb" data-reveal>
                <Link href="/produse" className="zs-crumb">Catalog</Link>
                {product.category_text && <>
                  <span className="zs-crumb-sep">/</span>
                  <Link href={catalogHref({ categorie: product.category_text })} className="zs-crumb">{product.category_text}</Link>
                </>}
                {product.subcategory_text && <>
                  <span className="zs-crumb-sep">/</span>
                  <Link href={catalogHref({ categorie: product.category_text, subcategorie: product.subcategory_text })} className="zs-crumb">{product.subcategory_text}</Link>
                </>}
              </nav>
              {product.brand_name && (
                <Link href={catalogHref({ brand: product.brand_name })} className="pd-brand" data-reveal style={stagger(1)}>{product.brand_name}</Link>
              )}
              <h1 className="pd-title" data-reveal style={stagger(2)}>{title}</h1>
              {product.short_description && (
                <div data-reveal style={stagger(3)}>
                  <ShortDescription text={product.short_description} className="pd-desc" />
                </div>
              )}
              {specs.length > 0 && (
                <div className="zs-stats" data-reveal style={stagger(4)}>
                  {specs.map(s => (
                    <div key={s.label} className="zs-stat"><span className="zs-stat-num">{s.value}</span><span className="zs-stat-label">{s.label}</span></div>
                  ))}
                </div>
              )}
              <div className="pd-actions" data-reveal style={stagger(5)}>
                <SkuCopyField sku={product.sku ?? product.slug ?? ''} />
                <VariantSelector variants={variants} currentSlug={product.slug} />
                <Link href={offerHref} className="pd-offer">Cere ofertă <span aria-hidden="true">→</span></Link>
              </div>
            </div>
            <div className="pd-media" data-reveal style={stagger(2)}>
              <HeroImage src={mainImg} alt={product.name} />
              <p className="pd-media-cap"><span>{product.brand_name}</span><span>{product.sku}</span></p>
            </div>
            <span className="zs-scroll-cue" aria-hidden="true">Derulează <span>↓</span></span>
          </header>

          {photos[0] && expand(
            photos[0],
            `${title} — în lucru`,
            ownPhotosShown ? `${product.brand_name ?? ''} · în lucru` : `${product.subcategory_text} · în lucru`,
            caracteristici[0]?.title ?? product.subcategory_text ?? title,
          )}

          {specs.length > 0 && (
            <section className="zs-block">
              {chapter('Specificații tehnice', 'Cifrele care contează la alegere — detaliile complete sunt în fișa producătorului.')}
              <div className="pd-specs">
                {specs.map((s, k) => (
                  <div key={s.label} className="pd-spec" data-reveal style={stagger(k)}>
                    <p className="pd-spec-label">{s.label}</p>
                    <p className="pd-spec-value">{s.value}</p>
                    {s.detail && <p className="pd-spec-detail">{s.detail}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {caracteristici.length > 0 && (
            <section className="zs-block">
              {sequence({ label: 'Caracteristici', lead: `Ce face diferența la ${model}.`, steps: caracteristici })}
            </section>
          )}

          {photos[1] && fullBleed({ src: photos[1], alt: `${title} — aplicație`, caption: `${product.subcategory_text ?? product.brand_name ?? ''} · în lucru` })}

          {galleryImgs.length > 0 && (
            <section className="zs-block">
              {chapter('Galerie', 'Click pe o imagine pentru a o vedea mărită.')}
              <div className="pd-gallery" data-reveal>
                <GallerySection images={galleryImgs} productName={product.name} />
              </div>
            </section>
          )}

          {aplicatii.length > 0 && (
            <section className="zs-block">
              {chapter('Aplicații recomandate')}
              <div className="zs-check pd-apps">
                {aplicatii.map((a, k) => (
                  <div key={a.title} className="zs-check-item" data-reveal style={stagger(k)}>
                    <span className="zs-check-n">{pad(k)}</span>
                    <span className="zs-check-name">{a.title}</span>
                    {a.detail && <span className="zs-check-why">{a.detail}</span>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {related.products.length > 0 && product.subcategory_text && (
            <section className="zs-block">
              {chapter('Produse similare', `Alte variante din ${product.subcategory_text}, cele mai apropiate de ${model} primele.`, (
                <Link href={catalogHref({ subcategorie: product.subcategory_text })} className="zs-car-link">
                  Vezi toate <b>{related.total.toLocaleString('ro')}</b> <span aria-hidden="true">→</span>
                </Link>
              ))}
              <div className="zs-scroll" data-reveal>
                {related.products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            </section>
          )}

          <section className="zs-block zs-end">
            <div className="zs-cta" data-reveal>
              <div>
                <h2 className="zs-cta-title">Cere oferta pentru {product.brand_name} {model}</h2>
                <p className="zs-cta-text">Preț pentru firme, disponibilitate și termen de livrare — îți răspundem cu oferta, nu doar cu un link. Sau sună-ne la 0248.222.298.</p>
              </div>
              <Link href={offerHref} className="zs-cta-btn">Cere ofertă <span aria-hidden="true">→</span></Link>
            </div>
          </section>
        </div>

        {/* only renders when the family has >4 variants */}
        <ProductVariantCarousel variants={familyVariants} />
      </main>

      <Footer />
    </>
  )
}
