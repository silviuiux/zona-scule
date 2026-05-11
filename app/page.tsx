import Link from 'next/link'
import Nav from '@/components/Nav'
import { getCategoriesWithCount, getBrands } from '@/lib/supabase'
import AnimatedHero from '@/components/AnimatedHero'
import HeroSearch from '@/components/HeroSearch'
import CategoryGrid from '@/components/CategoryGrid'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [categories, brands] = await Promise.all([
    getCategoriesWithCount(),
    getBrands(),
  ])

  return (
    <>
      <Nav />
      <style>{`
        /* ─── HERO ─────────────────────────────── */
        .hero {
          padding-top: 280px;
          padding-bottom: 24px;
          /* transparent so body dot pattern shows through */
          background: transparent;
          /* Sized so the 4th cat card (col 3, offset 0, height 400px) is
             cut off by exactly 5px at the bottom of the first fold.
             Falls back to a sane minimum on short viewports. */
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
          /* Foreground parallax: --hero-y is updated by <DotsParallax /> on
             scroll. Content moves at 120% of page scroll speed (extra -0.2 *
             scrollY on top of natural scroll). Layout stays centered when
             scrollY = 0. */
          transform: translate3d(0, var(--hero-y, 0px), 0);
          will-change: transform;
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-inner { transform: none; }
        }

        /* ─── Hero entrance — slide-in from right + fade ── */
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
        .authorized-row {
          display: flex; align-items: center; gap: 10px;
          flex-wrap: wrap;
        }
        .authorized-label {
          font-family: 'Recursive', sans-serif;
          font-size: 13px; color: rgba(0,0,0,0.6);
        }
        .authorized-link {
          font-family: 'Recursive', sans-serif;
          font-size: 13px; font-weight: 500;
          color: rgb(0,0,0);
          text-decoration: underline; text-underline-offset: 3px;
          letter-spacing: -0.01em;
        }
        .authorized-link:hover { color: rgb(217, 44, 43); }
        .hero-headline-old {
          font-family: 'Bungee', sans-serif;
          font-size: clamp(60px, 8vw, 120px);
          line-height: 1;
          letter-spacing: 0.01em;
          color: rgb(0,0,0);
          text-transform: lowercase;
        }
        .hero-headline-old .word-red {
          color: rgb(217, 44, 43);
          -webkit-text-stroke: 2px rgb(217, 44, 43);
          -webkit-text-fill-color: transparent;
        }
        .hero-sub {
          font-family: 'Recursive', sans-serif;
          font-size: 14px; color: rgba(0,0,0,0.5);
          line-height: 1.6; max-width: 380px;
        }
        .hero-cta-row {
          display: flex; align-items: stretch; gap: 0;
          width: fit-content;
          border-radius: 0px;
          overflow: hidden;
        }
        .hero-search-box {
          display: flex; align-items: center; gap: 10px;
          background: rgb(255,255,255);
          padding: 0 16px; height: 36px; width: 353px;
        }
        .hero-search-box input {
          border: none; outline: none; background: transparent;
          font-family: 'Recursive', sans-serif;
          font-size: 13px; color: rgba(0,0,0,0.4);
          width: 100%;
        }
        .hero-catalog-cta {
          display: flex; align-items: center; gap: 6px;
          background: rgb(217, 44, 43); color: rgb(255,255,255);
          padding: 0 20px; height: 36px;
          font-family: 'Recursive', sans-serif;
          font-size: 13px; font-weight: 500; letter-spacing: 0.02em;
          text-decoration: none; white-space: nowrap;
          transition: background 150ms;
        }
        .hero-catalog-cta:hover { background: rgb(190, 35, 34); }

        /* ─── CATEGORIES (2-row grid, exact Framer layout) ── */
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
          /* Transform driven by --cat-offset (set by <CategoryGrid /> on scroll
             for the staggered first row). No transition: rAF updates this every
             frame so a transition would lag behind the user's scroll. */
          transform: translate3d(0, var(--cat-offset, 0px), 0);
          will-change: transform;
        }
        /* Image fills the card; default 110% scale, eases back to 100% on hover */
        .cat-card-img-wrap {
          position: absolute; inset: 0;
          overflow: hidden;
          transform: scale(1.1);
          transition: transform 600ms cubic-bezier(0.22, 1, 0.36, 1);
          will-change: transform;
        }
        .cat-card-img {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
        }
        .cat-card:hover .cat-card-img-wrap {
          transform: scale(1.0);
        }
        @media (prefers-reduced-motion: reduce) {
          .cat-card-img-wrap { transition: none; }
        }
        .cat-card-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 50%, transparent 75%);
          transition: opacity 300ms ease;
        }
        /* Bottom content */
        .cat-card-bottom {
          position: absolute; bottom: 0; left: 0; right: 0;
          padding: 16px;
        }
        /* Count — always visible above title */
        .cat-card-count {
          font-family: 'Inter', sans-serif;
          font-size: 10px; font-weight: 600; letter-spacing: 0.06em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.55);
          display: block;
          margin-bottom: 5px;
        }
        .cat-card-label {
          font-family: 'Recursive', sans-serif;
          font-size: 15px; font-weight: 500;
          color: rgb(255,255,255); letter-spacing: -0.01em;
          line-height: 1.3;
          display: block; margin-bottom: 0;
        }
        /* Desc hidden by default, slides in on hover */
        .cat-card-desc {
          font-family: 'Recursive', sans-serif;
          font-size: 12px; color: rgba(255,255,255,0.75); line-height: 1.5;
          display: block;
          max-height: 0; overflow: hidden;
          opacity: 0;
          margin-top: 0;
          transition: max-height 300ms ease-in-out, opacity 250ms ease-in-out, margin-top 300ms ease;
        }
        .cat-card:hover .cat-card-desc {
          max-height: 80px;
          opacity: 1;
          margin-top: 6px;
        }

        /* ─── SERVICES ────────────────────────── */
        .services-section {
          max-width: 1440px; margin: 0 auto;
          padding: 0 12px 96px;
          display: flex; flex-direction: column; gap: 64px;
        }
        .services-header {
          display: flex; flex-direction: column; gap: 8px;
          align-items: flex-start; text-align: left;
        }
        .section-title {
          font-family: 'Bungee', sans-serif;
          font-size: clamp(32px, 4vw, 56px);
          color: rgb(0,0,0); line-height: 1;
          text-transform: uppercase;
        }
        .section-sub {
          font-family: 'Recursive', sans-serif;
          font-size: 14px; color: rgba(0,0,0,0.5);
          font-weight: 500;
        }
        .services-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
        }
        .service-card {
          border-radius: 4px; overflow: hidden;
          display: flex; flex-direction: column;
          height: 707px;
        }
        .service-img {
          flex: 1; position: relative; background: rgb(220,218,214);
          overflow: hidden;
        }
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
          font-size: 12px; font-weight: 500;
          letter-spacing: 0.04em; text-transform: lowercase;
          text-decoration: none;
          display: inline-flex; align-items: center; gap: 5px;
          transition: gap 150ms;
        }
        .service-cta:hover { gap: 9px; }

        /* ─── FOOTER ──────────────────────────── */
        .footer { background: rgb(244, 244, 244); border-top: 1px solid rgba(0,0,0,0.08); }
        .footer-social {
          padding: 20px 12px; max-width: 1440px; margin: 0 auto;
          display: flex; gap: 48px; justify-content: center;
          border-bottom: 1px solid rgba(0,0,0,0.08);
        }
        .footer-social a {
          font-family: 'Inter', sans-serif;
          font-size: 12px; color: rgba(0,0,0,0.5);
          text-decoration: none;
        }
        .footer-social a:hover { color: rgb(0,0,0); }
        .footer-grid {
          max-width: 1440px; margin: 0 auto;
          padding: 48px 12px;
          display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 48px;
        }
        .footer-col-title {
          font-family: 'Inter', sans-serif;
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: rgb(0,0,0); margin-bottom: 14px;
        }
        .footer-link {
          font-family: 'Recursive', sans-serif;
          font-size: 13px; color: rgba(0,0,0,0.5);
          text-decoration: none; display: block; margin-bottom: 8px;
        }
        .footer-link:hover { color: rgb(0,0,0); }
        .footer-bottom {
          border-top: 1px solid rgba(0,0,0,0.08); padding: 14px 12px;
          max-width: 1440px; margin: 0 auto;
          display: flex; justify-content: space-between; align-items: center;
        }
        .footer-bottom span, .footer-bottom a {
          font-family: 'Recursive', sans-serif;
          font-size: 11px; color: rgba(0,0,0,0.35); text-decoration: none;
        }
        .footer-bottom a { color: rgb(217, 44, 43); }

        /* ══ RESPONSIVE ══════════════════════════════════════════════ */

        @media (max-width: 768px) {
          /* Hero */
          .hero { min-height: auto; padding-top: 72px; padding-bottom: 48px; }
          .hero-inner { gap: 20px; padding: 0 16px; }
          .hero-cta-row { flex-direction: column; width: 100%; }
          .hero-search-box { width: 100%; }
          .hero-catalog-cta { justify-content: center; }

          /* Categories */
          .cats-section { padding: 0 16px 64px; }
          .cats-row { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .cat-card { height: 260px; }

          /* Services */
          .services-section { padding: 0 16px 64px; gap: 40px; }
          .services-grid { grid-template-columns: 1fr; }
          .service-card { height: auto; }
          .service-img { height: 260px; }

          /* Footer */
          .footer-social { gap: 24px; flex-wrap: wrap; }
          .footer-grid { grid-template-columns: 1fr; gap: 32px; padding: 36px 16px; }
          .footer-bottom { flex-direction: column; gap: 6px; text-align: center; }
        }

        @media (max-width: 480px) {
          /* Single column categories on very small screens */
          .cats-row { grid-template-columns: 1fr; }
          .cat-card { height: 220px; }
        }
      `}</style>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-inner">
          <AnimatedHero brands={brands} />

          {/* Subline */}
          <p className="hero-sub">
            Lider in furnizarea de scule electrice,<br />
            industriale si de constructii de peste 26 de ani
          </p>

          {/* CTA row */}
          <div className="hero-cta-row">
            <HeroSearch />
            <Link href="/produse" className="hero-catalog-cta">
              CATALOG
            </Link>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES — staggered first row collapses on scroll ── */}
      <section className="cats-section">
        <CategoryGrid categories={categories} />
      </section>

      {/* ── SERVICES — exact Framer CardS1 colors ── */}
      <section className="services-section">
        <div className="services-header">
          <h2 className="section-title">SERVICII COMPLETE</h2>
          <p className="section-sub">Scule profesionale, consultanta, achizitii, garantie si service</p>
        </div>
        <div className="services-grid">
          {[
            { bg: 'rgb(255,255,255)', color: 'rgb(30,30,30)', title: 'Consultanta', body: 'Expertiză tehnică pentru alegerea sculei potrivite proiectului tău. Intri cu întrebări, pleci cu soluții', cta: 'hai in showroom', ctaColor: 'rgb(30,30,30)', href: '/contact' },
            { bg: 'rgb(217,44,43)', color: 'rgb(255,255,255)', title: 'Service', body: 'Echipa noastră de tehnicieni menține motoarele turate. Intervenții prompte pentru ca tu să nu te oprești din lucru.', cta: 'solicita o reparatie', ctaColor: 'rgb(255,255,255)', href: '/contact' },
            { bg: 'rgb(30,30,30)', color: 'rgb(255,255,255)', title: 'Garantie', body: 'Acoperire extinsă și proceduri simplificate. Prioritatea noastră este funcționarea echipamentului tău.', cta: 'vezi acoperirea', ctaColor: 'rgb(255,255,255)', href: '/contact' },
          ].map((s, i) => (
            <Link key={i} href={s.href} style={{ textDecoration: 'none' }}>
              <div className="service-card">
                <div className="service-img" />
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

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-social">
          {['Facebook', 'Instagram', 'YouTube', 'Email', 'Telefon'].map(s => (
            <a key={s} href="#">{s}</a>
          ))}
        </div>
        <div className="footer-grid">
          <p style={{ fontFamily: 'Recursive, sans-serif', fontSize: '13px', color: 'rgba(0,0,0,0.5)', lineHeight: 1.7, maxWidth: '300px' }}>
            Technology Production SRL (Zona Scule) este distribuitor autorizat de scule profesionale cu peste 26 de ani de experiență în România.
          </p>
          <div>
            <p className="footer-col-title">INFORMATII</p>
            {['Termene si conditii','Politica de retur','Achizitii S.E.A.P.','ANPC SAL'].map(l => (
              <a key={l} href="#" className="footer-link">{l}</a>
            ))}
          </div>
          <div>
            <p className="footer-col-title">CONTACT</p>
            <p className="footer-link">0248.222.298</p>
            <p className="footer-link">contact@zonascule.ro</p>
            <p className="footer-link">Sfanta Vineri 28, Pitesti</p>
            <p style={{ fontFamily: 'Recursive, monospace', fontSize: '11px', color: 'rgba(0,0,0,0.3)' }}>CIF / VAT: RO 6796092</p>
          </div>
        </div>
        <div className="footer-bottom">
          <span>ZONA SCULE : Technology Promotion SRL</span>
          <a href="https://x.com/silviux">silviuX</a>
          <span>2026</span>
        </div>
      </footer>
    </>
  )
}
