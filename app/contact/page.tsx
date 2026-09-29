import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import TestimonialsCarousel from '@/components/TestimonialsCarousel'
import { TESTIMONIALS } from '@/lib/testimonials'
import ContactForm from './ContactForm'
import ContactMap from './ContactMap'
import CountUp from '@/components/CountUp'
import { unstable_cache } from 'next/cache'
import { getRawProductCount, getCategoriesWithCount, getAllSubcategoriesWithCount, getBrands } from '@/lib/supabase'

// The catalog in four numbers, for "Despre noi" (cached for an hour)
const catalogStats = unstable_cache(async () => {
  const [products, cats, subs, brands] = await Promise.all([
    getRawProductCount().catch(() => 0),
    getCategoriesWithCount().catch(() => []),
    getAllSubcategoriesWithCount().catch(() => []),
    getBrands().catch(() => []),
  ])
  return {
    products,
    categories: cats.filter(c => c.product_count > 0 && c.name.toLowerCase() !== 'necategorizat').length,
    subcategories: subs.filter(s => s.product_count > 0).length,
    brands: brands.filter(b => b.product_count > 0).length,
  }
}, ['contact-catalog-stats'], { revalidate: 3600, tags: ['catalog'] })

export const metadata: Metadata = {
  title: 'Contact — Zona Scule',
  description: 'Technology Production SRL (Zona Scule) este distribuitor autorizat de scule profesionale cu peste 26 de ani de experiență în România.',
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ sku?: string; brand?: string; model?: string }>
}) {
  const stats = await catalogStats()
  const facts = [
    { value: stats.products, label: 'Produse în catalog', href: '/produse' },
    { value: stats.brands, label: 'Branduri distribuite', href: '/branduri' },
    { value: stats.categories, label: 'Categorii', href: '/produse' },
    { value: stats.subcategories, label: 'Subcategorii', href: '/produse' },
  ]
  return (
    <>
      <Nav />
      <style>{`
        .contact-page {
          padding-top: var(--nav-h);
          min-height: 100vh;
          /* Transparent over the white body, so the dot grid and laser show
             through; positioned so content paints above body::before. */
          position: relative; z-index: 1;
          /* Roomier rhythm than the rest of the site: every gap on this page
             (hero top, between sections, heading → content) uses this. */
          --space-section: clamp(120px, 11vw, 168px);
        }
        .contact-inner {
          /* Same max-width + 12px side padding as the nav's own container
             (Nav.tsx .nav-inner) — was 102px, way more inset than the nav,
             which is why this page read as noticeably narrower. */
          max-width: 1440px; margin: 0 auto;
          padding: 0 var(--gutter);
        }
        .contact-inner.after-map { padding: 0 var(--gutter) var(--space-section); }
        .section-head { display: flex; flex-direction: column; gap: 14px; }
        .contact-section { margin-top: var(--space-section); scroll-margin-top: 96px; }

        /* ── Info bar ── */
        /* ── Hero: the letter on the left, the details on the right, a
           plotter-pen cue at the fold that drops into the map below ── */
        .c-hero {
          min-height: calc(100vh - var(--nav-h));
          display: flex; flex-direction: column;
          padding-top: clamp(32px, 6vh, 72px);
        }
        .c-hero-grid {
          flex: 1; align-content: center;
          /* 12 columns: the form on 4, two empty, the details on 4, two empty */
          display: grid; grid-template-columns: repeat(12, minmax(0, 1fr));
          column-gap: 16px; row-gap: 48px;
          align-items: end;
          padding-bottom: clamp(40px, 8vh, 96px);
        }
        .c-hero-grid > .cf { grid-column: 1 / span 4; }
        .c-details { grid-column: 7 / span 4; display: flex; flex-direction: column; }
        @media (max-width: 1100px) {
          .c-hero-grid > .cf { grid-column: 1 / span 6; }
          .c-details { grid-column: 8 / span 5; }
        }
        .c-detail {
          display: grid; grid-template-columns: 92px 1fr; align-items: baseline; gap: 16px;
          padding: 18px 0;
          border-top: 1px solid rgba(0,0,0,0.1);
          text-decoration: none; color: inherit;
        }
        .c-detail:last-child { border-bottom: 1px solid rgba(0,0,0,0.1); }
        .c-detail-label {
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 10.5px; letter-spacing: 0.12em; text-transform: uppercase;
          color: rgba(0,0,0,0.4);
        }
        .c-detail-value {
          font-family: 'JetBrains Mono', ui-monospace, monospace; font-weight: 500;
          font-size: clamp(15px, 1.25vw, 18px); letter-spacing: -0.01em; line-height: 1.35;
          color: rgb(0,0,0);
        }
        .c-detail-value small { display: block; font-weight: 400; font-size: 12px; letter-spacing: 0; color: rgba(0,0,0,0.45); margin-top: 4px; }
        a.c-detail .c-detail-value { transition: color 150ms; }
        a.c-detail:hover .c-detail-value { color: rgb(217,44,43); }
        .c-detail-value.red { color: rgb(217,44,43); }

        .c-cue {
          position: relative;
          display: grid; grid-template-columns: 1fr auto 1fr; align-items: end;
          padding-bottom: 20px;
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 10.5px; letter-spacing: 0.12em; text-transform: uppercase;
          color: rgba(0,0,0,0.4);
        }
        .c-cue-right { text-align: right; }
        .c-cue-pen { position: relative; width: 33px; height: 72px; }
        .c-cue-pen svg { position: absolute; left: 0; top: 0; }
        .c-cue-line {
          position: absolute; left: 16px; top: 33px; bottom: -20px; width: 1px;
          background: rgb(217,44,43); transform-origin: top;
          animation: c-cue-drop 2.6s cubic-bezier(0.65, 0, 0.35, 1) infinite;
        }
        @keyframes c-cue-drop {
          0% { transform: scaleY(0); opacity: 1; }
          55% { transform: scaleY(1); opacity: 1; }
          100% { transform: scaleY(1); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) { .c-cue-line { animation: none; } }

        /* ── Despre noi: a tall, quiet section — the title, then the
           catalog in four big numbers ── */
        .about {
          min-height: 100vh;
          display: flex; flex-direction: column; justify-content: center;
          padding: clamp(96px, 16vh, 200px) 0;
        }
        .about-grid {
          display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); column-gap: 16px; row-gap: 40px;
          align-items: end; margin-bottom: clamp(96px, 16vh, 180px);
        }
        .about-grid .section-head { grid-column: 1 / span 7; }
        .about-title .red { color: rgb(217,44,43); }
        .about-lead {
          grid-column: 9 / span 4;
          font-family: 'Recursive', sans-serif;
          font-size: 17px; line-height: 1.7; color: rgba(0,0,0,0.6);
        }
        .about-facts {
          display: grid; grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
        }
        .about-fact {
          display: flex; flex-direction: column; gap: 20px;
          padding-top: 28px; border-top: 1px solid rgba(0,0,0,0.14);
          text-decoration: none; color: inherit;
        }
        .about-fact-value {
          font-family: 'Neuton', serif;
          font-size: clamp(56px, 6.4vw, 104px); line-height: 0.9; letter-spacing: -0.02em;
          color: rgb(0,0,0); font-variant-numeric: tabular-nums;
          transition: color 200ms;
        }
        .about-fact:hover .about-fact-value { color: rgb(217,44,43); }
        .about-fact-label {
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase;
          line-height: 1.6; color: rgba(0,0,0,0.5);
        }
        .about-fact-label b { font-weight: 400; color: rgb(217,44,43); margin-left: 6px; opacity: 0; transition: opacity 200ms; }
        .about-fact:hover .about-fact-label b { opacity: 1; }
        @media (max-width: 1024px) {
          .about-grid .section-head, .about-lead { grid-column: 1 / -1; }
          .about-facts { grid-template-columns: repeat(2, minmax(0, 1fr)); row-gap: 56px; }
        }

        @media (max-width: 768px) {
          .contact-page { --space-section: 88px; }
          .about { min-height: 0; padding: 56px 0; }
          .c-hero { min-height: 0; padding-top: 40px; }
          .c-hero-grid { grid-template-columns: 1fr; gap: 48px; }
          .c-hero-grid > .cf, .c-details { grid-column: 1 / -1; }
          .c-cue-left { display: none; }
          .c-cue { grid-template-columns: auto 1fr; gap: 16px; }
        }
      `}</style>

      <div className="contact-page">
        <div className="contact-inner">

          {/* Hero: the quote-request letter + contact details */}
          <section className="c-hero">
            <div className="c-hero-grid">
              <ContactForm searchParams={searchParams} />
              <div className="c-details">
                <a href="tel:0248222298" className="c-detail">
                  <span className="c-detail-label">Telefon</span>
                  <span className="c-detail-value red">0248.222.298</span>
                </a>
                <a href="mailto:office@zonascule.ro" className="c-detail">
                  <span className="c-detail-label">E-mail</span>
                  <span className="c-detail-value">office@zonascule.ro<small>Răspundem în maximum 24 de ore</small></span>
                </a>
                <div className="c-detail">
                  <span className="c-detail-label">Program</span>
                  <span className="c-detail-value">08:30 – 17:00<small>Luni – Vineri</small></span>
                </div>
                <div className="c-detail">
                  <span className="c-detail-label">Adresă</span>
                  <span className="c-detail-value">Sfânta Vineri 28<small>110024 Pitești, Argeș</small></span>
                </div>
              </div>
            </div>
            <div className="c-cue" aria-hidden="true">
              <span className="c-cue-left">44°51′28″N · 24°52′46″E</span>
              <span className="c-cue-pen">
                <svg width="33" height="33" viewBox="-16.5 -16.5 33 33">
                  <path d="M-16 0 H-7 M7 0 H16 M0 -16 V-7 M0 7 V16" stroke="rgba(217,44,43,0.8)" fill="none" />
                  <circle r="7" stroke="rgb(217,44,43)" fill="none" />
                  <circle r="2.6" fill="rgb(217,44,43)" />
                </svg>
                <span className="c-cue-line" />
              </span>
              <span className="c-cue-right">Derulează · drumul până la noi</span>
            </div>
          </section>
        </div>

        <ContactMap />

        <div className="contact-inner after-map">

          {/* Despre noi (was /despre-noi, which now redirects here) */}
          <section id="despre-noi" className="contact-section about">
            <div className="about-grid">
              <div className="section-head">
                <span className="eyebrow-mono">Despre noi</span>
                <h2 className="display-title about-title">
                  Distribuitor autorizat de <span className="red">scule profesionale</span>, de peste 26 de ani.
                </h2>
              </div>
              <p className="about-lead">
                Technology Production SRL (Zona Scule) furnizează scule electrice, industriale
                și de construcții pentru profesioniști și ateliere din toată țara.
              </p>
            </div>
            <div className="about-facts">
              {facts.map(f => (
                <a key={f.label} href={f.href} className="about-fact">
                  <span className="about-fact-value">{f.value > 0 ? <CountUp value={f.value} onView /> : '—'}</span>
                  <span className="about-fact-label">{f.label}<b aria-hidden="true">→</b></span>
                </a>
              ))}
            </div>
          </section>

          {/* Testimoniale — last section before the footer */}
          <section className="contact-section">
            <TestimonialsCarousel items={TESTIMONIALS} />
          </section>

        </div>
      </div>
      <Footer />
    </>
  )
}
