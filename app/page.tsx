import Link from 'next/link'
import Image from 'next/image'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { getCategoriesWithCount, getBrands, getFeaturedSubcategoriesWithImage, getTotalProductCount } from '@/lib/supabase'
import AnimatedHero from '@/components/AnimatedHero'
import HeroSearch from '@/components/HeroSearch'
import CategoryGrid from '@/components/CategoryGrid'
import SubcategoryCarousel from '@/components/SubcategoryCarousel'

export const dynamic = 'force-dynamic'


export default async function HomePage() {
  const [categories, brands, featuredSubs, totalCount] = await Promise.all([
    getCategoriesWithCount(),
    getBrands(),
    getFeaturedSubcategoriesWithImage(),
    getTotalProductCount(),
  ])

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
          font-size: 14px; color: rgba(0,0,0,0.5);
          line-height: 1.6; max-width: 380px;
        }
        .hero-cta-row {
          display: flex; align-items: stretch; gap: 0;
          width: 50%;
          min-width: 320px;
          border: 1px solid rgba(0,0,0,0.12);
          border-radius: 3px;
          overflow: hidden;
        }
        /* ── Hero search input ── */
        .hero-search-box {
          display: flex; align-items: center; gap: 8px;
          background: rgb(255,255,255);
          padding: 0 12px;
          flex: 1;
          min-width: 0;
          height: 44px;
        }
        .hero-search-box input {
          flex: 1; min-width: 0;
          border: none; outline: none;
          background: transparent;
          font-family: 'Recursive', sans-serif;
          font-size: 13px; color: rgb(0,0,0);
        }
        .hero-search-box input::placeholder { color: rgba(0,0,0,0.35); }
        .hero-search-box button {
          background: none; border: none; cursor: pointer;
          display: flex; align-items: center; padding: 2px;
          color: rgba(0,0,0,0.3); flex-shrink: 0;
          transition: color 150ms;
        }
        .hero-search-box button:hover { color: rgb(217,44,43); }
        .hero-catalog-cta {
          display: flex; align-items: center; gap: 6px;
          background: rgb(217, 44, 43); color: rgb(255,255,255);
          padding: 0 24px; height: 44px;
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
          padding: 0 12px 96px;
        }
        .cats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 16px;
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
          padding: 0 12px 96px;
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
        }
        .service-card {
          border-radius: 4px; overflow: hidden;
          display: flex; flex-direction: column; height: 707px;
        }
        .service-img { flex: 1; position: relative; background: rgb(220,218,214); overflow: hidden; }
        .service-body { padding: 24px; flex-shrink: 0; }
        .service-title {
          font-family: 'Bungee', sans-serif;
          font-size: 28px; text-transform: uppercase;
          line-height: 1; margin-bottom: 12px;
        }
        .service-desc {
          font-family: 'Recursive', sans-serif;
          font-size: 13px; line-height: 1.65; margin-bottom: 20px;
        }
        .service-cta {
          font-family: 'Recursive', sans-serif;
          font-size: 12px; font-weight: 600;
          letter-spacing: 0.06em; text-transform: uppercase;
          text-decoration: none;
          display: inline-flex; align-items: center; gap: 5px;
          transition: gap 150ms;
        }
        .service-cta:hover { gap: 9px; }

        /* ─── CAROUSEL ── */
        .carousel-section {
          background: rgb(18, 18, 18);
          padding: 80px 0 64px;
        }
        .carousel-inner {
          max-width: 1440px; margin: 0 auto; padding: 0 24px;
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
          padding: 80px 12px;
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
          .hero { min-height: calc(100svh - 52px); padding-top: 48px; padding-bottom: 48px; }
          .hero-inner { gap: 20px; padding: 0 16px; }
          .hero-cta-row {
            flex-direction: column; width: 100%;
            border: none; border-radius: 0;
            gap: 16px;
          }
          .hero-search-box {
            min-width: 0; width: 100%;
            border: 1px solid rgba(0,0,0,0.12);
            border-radius: 3px;
          }
          .hero-catalog-cta {
            justify-content: center;
            border-left: none; border-top: none;
            border-radius: 3px;
          }

          .cats-section { padding: 0 16px 64px; }
          .cats-row { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .cat-card { height: 260px; }

          .services-section { padding: 0 0 64px; gap: 40px; }
          .services-header { padding: 0 16px; }
          .services-grid {
            display: flex;
            overflow-x: auto;
            gap: 12px;
            padding: 0 16px;
            margin: 0;
            scrollbar-width: none; -ms-overflow-style: none;
          }
          .services-grid::-webkit-scrollbar { display: none; }
          .services-grid > a { flex-shrink: 0; width: 75vw; }
          .service-card { height: auto; width: 100%; }
          .service-img { flex: none; height: auto; aspect-ratio: 2/3; }

          .carousel-section { padding: 56px 0 48px; }
          .carousel-inner { padding: 0 16px; }

          .contact-banner-wrap { padding: 48px 16px; }
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
          <p className="hero-sub">
            Lider in furnizarea de scule electrice,<br />
            industriale si de constructii de peste 26 de ani
          </p>
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

      {/* ── SERVICES ── */}
      <section className="services-section">
        <div className="services-header">
          <h2 className="section-title">SERVICII COMPLETE</h2>
          <p className="section-sub">Scule profesionale, consultanta, achizitii, garantie si service</p>
        </div>
        <div className="services-grid">
          {[
            { bg: 'rgb(255,255,255)', color: 'rgb(30,30,30)', title: 'Consultanta', body: 'Expertiză tehnică pentru alegerea sculei potrivite proiectului tău. Intri cu întrebări, pleci cu soluții', cta: 'HAI IN SHOWROOM', ctaColor: 'rgb(30,30,30)', href: '/contact', img: '/service-consultanta.avif' },
            { bg: 'rgb(217,44,43)', color: 'rgb(255,255,255)', title: 'Service', body: 'Echipa noastră de tehnicieni menține motoarele turate. Intervenții prompte pentru ca tu să nu te oprești din lucru.', cta: 'SOLICITA O REPARATIE', ctaColor: 'rgb(255,255,255)', href: '/contact', img: '/service-service.avif' },
            { bg: 'rgb(30,30,30)', color: 'rgb(255,255,255)', title: 'Garantie', body: 'Acoperire extinsă și proceduri simplificate. Prioritatea noastră este funcționarea echipamentului tău.', cta: 'VEZI ACOPERIREA', ctaColor: 'rgb(255,255,255)', href: '/contact', img: '/service-garantie.avif' },
          ].map((s, i) => (
            <Link key={i} href={s.href} style={{ textDecoration: 'none' }}>
              <div className="service-card">
                <div className="service-img">
                  <Image src={s.img} alt={s.title} fill style={{ objectFit: 'cover', objectPosition: 'center top' }} sizes="(max-width: 768px) 100vw, 33vw" />
                </div>
                <div className="service-body" style={{ background: s.bg }}>
                  <h3 className="service-title" style={{ color: s.color }}>{s.title}</h3>
                  <p className="service-desc" style={{ color: s.color === 'rgb(30,30,30)' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.75)' }}>{s.body}</p>
                  <span className="service-cta" style={{ color: s.ctaColor }}>{s.cta} →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── CAROUSEL — Featured subcategories ── */}
      {featuredSubs.length > 0 && (
        <section className="carousel-section">
          <div className="carousel-inner">
            <div className="carousel-header">
              <h2 className="carousel-title">EXPLOREAZA</h2>
              <p className="carousel-sub">Categorii de produse din catalogul nostru</p>
            </div>
          </div>
          <SubcategoryCarousel subs={featuredSubs} />
        </section>
      )}

      {/* ── CONTACT BANNER ── */}
      <div className="contact-banner-wrap">
        <div className="contact-banner">
          <div>
            <span className="contact-banner-eyebrow">Hai sa vorbim</span>
            <h2 className="contact-banner-title">RĂSPUNDEM RAPID.<br />LIVRĂM ÎN TOATĂ ȚARA.</h2>
            <p className="contact-banner-sub">Consultanța specializata</p>
          </div>
          <Link href="/contact" className="contact-banner-btn">CONTACT ↗</Link>
        </div>
      </div>

      <Footer />
    </>
  )
}
