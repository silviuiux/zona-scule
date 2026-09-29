import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import TestimonialsCarousel from '@/components/TestimonialsCarousel'
import { TESTIMONIALS } from '@/lib/testimonials'
import ContactForm from './ContactForm'
import ContactMap from './ContactMap'

export const metadata: Metadata = {
  title: 'Contact — Zona Scule',
  description: 'Technology Production SRL (Zona Scule) este distribuitor autorizat de scule profesionale cu peste 26 de ani de experiență în România.',
}

export default function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ sku?: string; brand?: string; model?: string }>
}) {
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

        /* ── Despre noi ── */
        .about-grid {
          display: grid; grid-template-columns: 7fr 5fr; gap: 64px;
          align-items: end; margin-bottom: 48px;
        }
        .about-title .red { color: rgb(217,44,43); }
        .about-lead {
          font-family: 'Recursive', sans-serif;
          font-size: 17px; line-height: 1.6; color: rgba(0,0,0,0.6);
          max-width: 56ch;
        }
        .about-facts {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .about-fact {
          padding: 32px;
          background: rgb(255,255,255);
          border: 1px solid rgba(0,0,0,0.08);
          display: flex; flex-direction: column; gap: 12px;
          text-decoration: none;
        }
        a.about-fact { transition: border-color 150ms; }
        a.about-fact:hover { border-color: rgba(217,44,43,0.3); }
        .about-fact-value {
          font-family: 'Neuton', serif;
          font-size: 48px; line-height: 1; color: rgb(217,44,43);
        }
        .about-fact-label {
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase;
          line-height: 1.6; color: rgba(0,0,0,0.5);
        }

        @media (max-width: 768px) {
          .contact-page { --space-section: 88px; }
          .about-grid { grid-template-columns: 1fr; gap: 24px; }
          .about-facts { grid-template-columns: 1fr; }
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
          <section id="despre-noi" className="contact-section">
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
              <div className="about-fact">
                <span className="about-fact-value">26+</span>
                <span className="about-fact-label">Ani de experiență pe piața din România</span>
              </div>
              <div className="about-fact">
                <span className="about-fact-value">S.E.A.P.</span>
                <span className="about-fact-label">Furnizor înregistrat pentru achiziții publice</span>
              </div>
              <div className="about-fact">
                <span className="about-fact-value">Național</span>
                <span className="about-fact-label">Livrăm în toată țara</span>
              </div>
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
