import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { getCategoriesWithCount, getBrands, getFeaturedSubcategoriesWithImage, getRawProductCount } from '@/lib/supabase'
import AnimatedHero from '@/components/AnimatedHero'
import HeroSearch from '@/components/HeroSearch'
import CategoryGrid from '@/components/CategoryGrid'
import SubcategoryCarousel from '@/components/SubcategoryCarousel'
import ServicesGrid from '@/components/ServicesGrid'

// Homepage data (categories, brands, featured subcategories, total count)
// changes rarely and never depends on the request — ISR instead of a fresh
// DB hit on every load (REBUILD.md §3.5/§6). Revalidates hourly; admin edits
// also call revalidatePath('/') for instant refresh.
export const revalidate = 3600


export default async function HomePage() {
  const [categoriesRaw, brands, featuredSubs, totalCount] = await Promise.all([
    getCategoriesWithCount(),
    getBrands(),
    getFeaturedSubcategoriesWithImage(),
    getRawProductCount(),
  ])

  // Hide the catch-all "Necategorizat" bucket from the homepage categories grid
  const categories = categoriesRaw.filter(c => c.name.toLowerCase() !== 'necategorizat')

  // Enrich subcategories with their parent category name for correct deep-link URLs
  const enrichedSubs = featuredSubs.map(s => ({
    ...s,
    category_name: s.parent_category_id
      ? (categories.find(c => c.id === s.parent_category_id)?.name ?? null)
      : null,
  }))

  return (
    <>
      <Nav />
      <style>{`
        /* ─── HERO ─────────────────────────────── */
        .hero {
          padding-top: 280px;
          padding-bottom: 24px;
          background: transparent;
          min-height: max(320px, calc(100vh - 395px));
          display: flex; align-items: center;
          overflow: hidden;
        }
        .hero-inner {
          max-width: 1440px; margin: 0 auto;
          padding: 0 12px;
          width: 100%;
          display: flex; flex-direction: column;
          gap: 26px;
          transform: translate3d(0, var(--hero-y, 0px), 0);
          will-change: transform;
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-inner { transform: none; }
        }

        /* ─── Hero entrance ── */
        @keyframes hero-in {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .hero-inner .brand-chips,
        .hero-inner .hero-title,
        .hero-inner .hero-sub,
        .hero-inner .hero-cta-row {
          opacity: 0;
          animation: hero-in 720ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .hero-inner .brand-chips  { animation-delay:  80ms; }
        .hero-inner .hero-title   { animation-delay: 220ms; }
        .hero-inner .hero-sub     { animation-delay: 360ms; }
        .hero-inner .hero-cta-row { animation-delay: 500ms; }
        @media (prefers-reduced-motion: reduce) {
          .hero-inner .brand-chips,
          .hero-inner .hero-title,
          .hero-inner .hero-sub,
          .hero-inner .hero-cta-row {
            animation: none; opacity: 1;
          }
        }
        .hero-sub {
          font-family: 'Recursive', sans-serif;
          font-weight: 400;
          font-size: 18px; color: rgba(0,0,0,0.5);
          line-height: 1.4;
          max-width: 50%;
        }
        @media (max-width: 768px) {
          /* Full width instead of the desktop 50% cap — lets the subtitle
             wrap onto ~2 lines instead of 5 in the narrow mobile column. */
          .hero-sub { max-width: 100%; }
        }
        .hero-cta-row {
          display: flex; align-items: stretch; gap: 0;
          width: 50%;
          min-width: 320px;
          border: 1px solid rgba(0,0,0,0.12);
          border-radius: 4px;
          overflow: hidden;
        }
        /* ── Hero search input ── */
        .hero-search-box {
          display: flex; align-items: center; gap: 16px;
          background: rgb(255,255,255);
          padding: 0 12px;
          flex: 1;
          min-width: 0;
          height: 44px;
        }
        .hero-search-icon {
          background: none; border: none; cursor: pointer;
          display: flex; align-items: center; padding: 0;
          color: rgba(0,0,0,0.3); flex-shrink: 0;
          transition: color 150ms;
        }
        .hero-search-icon:hover { color: rgb(217,44,43); }
        .hero-search-input-wrap {
          position: relative; flex: 1; min-width: 0;
          display: flex; align-items: center; height: 100%;
        }
        .hero-search-input-wrap input {
          position: relative; z-index: 1;
          width: 100%; border: none; outline: none;
          background: transparent;
          font-family: 'Recursive', sans-serif;
          font-size: 13px; color: rgb(0,0,0);
          text-align: left;
        }
        .hero-search-placeholder {
          position: absolute; left: 0; top: 50%; transform: translateY(-50%);
          pointer-events: none; white-space: nowrap;
          overflow: hidden; max-width: 100%;
          font-family: 'Recursive', sans-serif;
          font-size: 13px; color: rgba(0,0,0,0.35);
        }
        .hero-search-placeholder-count { color: rgb(0,0,0); }
        .hero-catalog-cta {
          display: flex; align-items: center;
          background: rgb(217, 44, 43); color: rgb(255,255,255);
          padding: 0 36px; height: 44px;
          font-family: 'Inter', sans-serif;
          font-size: 12px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          text-decoration: none; white-space: nowrap;
          transition: background 150ms;
          border-left: 1px solid rgba(0,0,0,0.1);
        }
        .hero-catalog-cta:hover { background: rgb(190, 35, 34); }

        /* ─── CATEGORIES ── */
        .cats-section {
          background: transparent;
          max-width: 1440px; margin: 0 auto;
          padding: 0 12px 64px;
        }
        .cats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 16px;
          /* Clips any still-settling (offset) card to this row's own box,
             so it crops to a peek instead of spilling into the row below —
             see the long settle range in CategoryGrid.tsx. */
          overflow: hidden;
        }
        .cat-card {
          position: relative; overflow: hidden;
          border-radius: 8px; background: rgb(200,200,200);
          text-decoration: none; display: block;
          height: 400px;
          /* Two independent vertical motions on each card:
             1. Stagger (scroll-driven, instant) — goes on transform via
                --cat-offset, updated every rAF, NO transition (would lag scroll)
             2. Reveal (in-view-triggered) — goes on translate (separate CSS
                property), has a 700ms transition so it eases in once. */
          transform: translate3d(0, var(--cat-offset, 0px), 0);
          opacity: 0;
          translate: 0 24px;
          transition: opacity 700ms cubic-bezier(0.22, 1, 0.36, 1),
                      translate  700ms cubic-bezier(0.22, 1, 0.36, 1);
          will-change: transform, translate, opacity;
        }
        .cat-card.in-view { opacity: 1; translate: 0 0; }
        @media (prefers-reduced-motion: reduce) {
          .cat-card { opacity: 1; translate: 0 0; transition: none; }
        }
        .cat-card-img-wrap {
          position: absolute; inset: 0; overflow: hidden;
          transform: scale(1.1);
          transition: transform 600ms cubic-bezier(0.22, 1, 0.36, 1);
          will-change: transform;
        }
        .cat-card-img {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover; object-position: center; display: block;
        }
        .cat-card:hover .cat-card-img-wrap { transform: scale(1.0); }
        @media (prefers-reduced-motion: reduce) {
          .cat-card-img-wrap { transition: none; }
        }
        .cat-card-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 50%, transparent 75%);
        }
        .cat-card-bottom {
          position: absolute; bottom: 0; left: 0; right: 0; padding: 16px;
        }
        .cat-card-count {
          font-family: 'Inter', sans-serif;
          font-size: 10px; font-weight: 600; letter-spacing: 0.06em;
          text-transform: uppercase; color: rgba(255,255,255,0.55);
          display: block; margin-bottom: 5px;
        }
        .cat-card-label {
          font-family: 'Recursive', sans-serif;
          font-size: 15px; font-weight: 500;
          color: rgb(255,255,255); letter-spacing: -0.01em;
          line-height: 1.3; display: block;
        }
        .cat-card-desc {
          font-family: 'Recursive', sans-serif;
          font-size: 12px; color: rgba(255,255,255,0.75); line-height: 1.5;
          display: block; max-height: 0; overflow: hidden;
          opacity: 0; margin-top: 0;
          transition: max-height 300ms ease-in-out, opacity 250ms ease-in-out, margin-top 300ms ease;
        }
        .cat-card:hover .cat-card-desc { max-height: 80px; opacity: 1; margin-top: 6px; }

        /* ─── SERVICES ── */
        .services-section {
          max-width: 1440px; margin: 0 auto;
          padding: 64px 12px 64px;
          display: flex; flex-direction: column; gap: 64px;
        }
        .services-header { display: flex; flex-direction: column; gap: 8px; }
        .section-title {
          font-family: 'Bungee', sans-serif;
          font-size: clamp(32px, 4vw, 56px);
          color: rgb(0,0,0); line-height: 1; text-transform: uppercase;
        }
        .section-sub {
          font-family: 'Recursive', sans-serif;
          font-size: 14px; color: rgba(0,0,0,0.5); font-weight: 500;
        }
        .services-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
          /* Clips any still-settling (offset) card to the grid's own box,
             so it crops to a peek instead of spilling into the carousel
             section below — see the long settle range in ServicesGrid.tsx. */
          overflow: hidden;
        }
        .service-card {
          border-radius: 4px; overflow: hidden;
          display: flex; flex-direction: column; height: 707px;
          /* Scroll-stagger (continuous, no transition — would lag the scroll)
             lives on transform/--svc-offset. Hover lift lives on the separate
             scale property below, so the two never fight over transform. */
          transform: translate3d(0, var(--svc-offset, 0px), 0);
          will-change: transform;
        }
        .service-img { flex: 1; position: relative; background: rgb(220,218,214); overflow: hidden; }
        .service-body { padding: 24px; flex-shrink: 0; display: flex; flex-direction: column; position: relative; isolation: isolate; }
        .service-body > * { position: relative; z-index: 2; }
        .service-title {
          font-family: 'Bungee', sans-serif;
          font-size: 28px; text-transform: uppercase;
          line-height: 1; margin-bottom: 12px;
        }
        .service-desc {
          font-family: 'Recursive', sans-serif;
          font-size: 13px; line-height: 1.65; margin-bottom: 0;
        }
        /* Service card hover — whole card grows + image zooms in.
           Uses the standalone scale property (not transform) so it can
           have its own transition without animating the scroll-stagger. */
        .service-card {
          transition: scale 500ms cubic-bezier(0.22,1,0.36,1),
                      box-shadow 500ms cubic-bezier(0.22,1,0.36,1);
        }
        .services-grid a:hover .service-card {
          scale: 1.025;
          box-shadow: 0 24px 64px rgba(0,0,0,0.18);
        }
        @media (prefers-reduced-motion: reduce) {
          .service-card { transform: none; }
        }
        .service-img img {
          transition: transform 600ms cubic-bezier(0.22,1,0.36,1);
        }
        .services-grid a:hover .service-img img { transform: scale(1.07); }

        .service-cta {
          font-family: 'Recursive', sans-serif;
          font-size: 12px; font-weight: 600;
          letter-spacing: 0.06em; text-transform: uppercase;
          text-decoration: none;
          display: flex; align-items: center; justify-content: space-between;
          width: 100%;
          margin-top: auto;
          padding-top: 20px;
        }
        .service-cta-arrow {
          transition: transform 250ms cubic-bezier(0.22,1,0.36,1);
        }
        .services-grid a:hover .service-cta-arrow { transform: translateX(5px); }

        /* ─── CAROUSEL ── */
        .carousel-section {
          background-color: rgb(18, 18, 18);
          background-image: radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px);
          background-size: 28px 28px;
          padding: 64px 0 64px;
        }
        .carousel-inner {
          max-width: 1440px; margin: 0 auto; padding: 0 12px;
        }
        .carousel-header { margin-bottom: 40px; }
        .carousel-title {
          font-family: 'Bungee', sans-serif;
          font-size: clamp(28px, 4vw, 48px);
          color: rgb(255,255,255); text-transform: uppercase;
          line-height: 1; margin-bottom: 8px;
        }
        .carousel-sub {
          font-family: 'Recursive', sans-serif;
          font-size: 14px; color: rgba(255,255,255,0.35);
        }
        /* ─── CONTACT BANNER ── */
        .contact-banner-wrap {
          padding: 64px 12px;
          max-width: 1440px; margin: 0 auto;
        }
        .contact-banner {
          background: rgb(18, 18, 18);
          background-image: radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px);
          background-size: 28px 28px;
          border-radius: 10px;
          padding: 52px 64px;
          display: flex; align-items: center;
          justify-content: space-between; gap: 40px;
        }
        .contact-banner-eyebrow {
          font-family: 'Recursive', sans-serif;
          font-size: 13px; color: rgba(255,255,255,0.35);
          margin-bottom: 14px; display: block;
        }
        .contact-banner-title {
          font-family: 'Bungee', sans-serif;
          font-size: clamp(22px, 2.8vw, 38px);
          color: rgb(255,255,255); text-transform: uppercase;
          line-height: 1.1; margin-bottom: 10px;
        }
        .contact-banner-sub {
          font-family: 'Recursive', sans-serif;
          font-size: 13px; color: rgba(255,255,255,0.35);
        }
        .contact-banner-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgb(217, 44, 43); color: rgb(255,255,255);
          padding: 16px 36px; border-radius: 4px;
          font-family: 'Inter', sans-serif;
          font-size: 12px; font-weight: 700; letter-spacing: 0.08em;
          text-transform: uppercase; text-decoration: none;
          white-space: nowrap; flex-shrink: 0;
          transition: background 150ms;
        }
        .contact-banner-btn:hover { background: rgb(190, 35, 34); }

        /* footer styles live in components/Footer.tsx */

        /* ══ RESPONSIVE ══ */
        @media (max-width: 768px) {
          /* Nav is fixed at 52px tall — padding-top must clear it before
             adding the actual breathing room, or content sits flush/under
             the nav (was 48px total, less than the nav's own height). */
          .hero { min-height: 75vh; padding-top: 84px; padding-bottom: 48px; }
          .hero-inner { gap: 20px; padding: 0 32px; }
          .hero-cta-row {
            flex-direction: column; width: 100%;
            border: none; border-radius: 0;
            gap: 16px;
          }
          .hero-search-box {
            min-width: 0; width: 100%;
            height: auto; padding: 8px 12px;
            border: 1px solid rgba(0,0,0,0.12);
            border-radius: 3px;
          }
          .hero-catalog-cta {
            justify-content: center;
            height: auto; padding: 8px 24px;
            border-left: none; border-top: none;
            border-radius: 3px;
          }

          .cats-section { padding: 0 32px 64px; }
          .cats-row { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .cat-card { height: 260px; }

          .services-section { padding: 64px 0 64px; gap: 40px; }
          .services-header { padding: 0 32px; }
          .services-grid {
            display: flex;
            overflow-x: auto;
            gap: 12px;
            padding: 0 32px;
            margin: 0;
            scrollbar-width: none; -ms-overflow-style: none;
          }
          .services-grid::-webkit-scrollbar { display: none; }
          .services-grid > a { flex-shrink: 0; width: 75vw; align-self: stretch; }
          .service-card { height: 100%; width: 100%; }
          .service-img { flex: none; height: auto; aspect-ratio: 2/3; }
          .service-body { flex: 1; }
          .service-desc { margin-bottom: 16px; }

          .carousel-section { padding: 64px 0 64px; }
          .carousel-inner { padding: 0 32px; }

          .contact-banner-wrap { padding: 64px 32px; }
          .contact-banner { padding: 36px 24px; flex-direction: column; align-items: flex-start; gap: 28px; }
          .contact-banner-btn { width: 100%; justify-content: center; }

        }

        @media (max-width: 480px) {
          .cats-row { grid-template-columns: 1fr; }
          .cat-card { height: 220px; }
        }
      `}</style>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-inner">
          <AnimatedHero brands={brands} />
          <p className="hero-sub">Lider in furnizarea de scule electrice<br />industriale si de constructii de peste 26 de ani</p>
          <div className="hero-cta-row">
            <HeroSearch totalCount={totalCount} />
            <Link href="/produse" className="hero-catalog-cta">CATALOG</Link>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="cats-section">
        <CategoryGrid categories={categories} />
      </section>

      {/* ── CAROUSEL — Featured subcategories (before services) ── */}
      {enrichedSubs.length > 0 && (
        <section className="carousel-section noise-dark">
          <div className="carousel-inner">
            <div className="carousel-header">
              <h2 className="carousel-title">EXPLOREAZA</h2>
              <p className="carousel-sub">Categorii de produse din catalogul nostru</p>
            </div>
          </div>
          <SubcategoryCarousel subs={enrichedSubs} />
        </section>
      )}

      {/* ── SERVICES ── */}
      <section className="services-section">
        <div className="services-header">
          <h2 className="section-title">SERVICII COMPLETE</h2>
          <p className="section-sub">Scule profesionale, consultanta, achizitii, garantie si service</p>
        </div>
        <ServicesGrid
          items={[
            { bg: 'rgb(255,255,255)', color: 'rgb(30,30,30)', title: 'Consultanta', body: 'Expertiză tehnică pentru alegerea sculei potrivite proiectului tău. Intri cu întrebări, pleci cu soluții', cta: 'HAI IN SHOWROOM', ctaColor: 'rgb(30,30,30)', href: '/contact', img: '/service-consultanta.avif' },
            { bg: 'rgb(217,44,43)', color: 'rgb(255,255,255)', title: 'Service', body: 'Echipa noastră de tehnicieni menține motoarele turate. Intervenții prompte pentru ca tu să nu te oprești din lucru.', cta: 'SOLICITA O REPARATIE', ctaColor: 'rgb(255,255,255)', href: '/contact', img: '/service-service.avif' },
            { bg: 'rgb(30,30,30)', color: 'rgb(255,255,255)', title: 'Garantie', body: 'Acoperire extinsă și proceduri simplificate. Prioritatea noastră este funcționarea echipamentului tău.', cta: 'VEZI ACOPERIREA', ctaColor: 'rgb(255,255,255)', href: '/contact', img: '/service-garantie.avif' },
          ]}
        />
      </section>

      {/* ── CONTACT BANNER ── */}
      <div className="contact-banner-wrap">
        <div className="contact-banner noise-dark">
          <div>
            <span className="contact-banner-eyebrow">Hai sa vorbim</span>
            <h2 className="contact-banner-title">RĂSPUNDEM RAPID.<br />LIVRĂM ÎN TOATĂ ȚARA.</h2>
            <p className="contact-banner-sub">Consultanța specializata</p>
          </div>
          <Link href="/contact" className="contact-banner-btn">CONTACT</Link>
        </div>
      </div>

      <Footer />
    </>
  )
}
