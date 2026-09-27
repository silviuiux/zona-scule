import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import TestimonialsCarousel from '@/components/TestimonialsCarousel'
import { TESTIMONIALS } from '@/lib/testimonials'
import ContactForm from './ContactForm'

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
          padding-top: 52px;
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
          padding: 0 12px;
        }
        .contact-inner.after-map { padding: 0 12px var(--space-section); }
        .section-head { display: flex; flex-direction: column; gap: 14px; }
        .contact-section { margin-top: var(--space-section); scroll-margin-top: 96px; }

        /* ── Info bar ── */
        .contact-info-bar {
          margin-top: 56px; /* close under the hero so the cards peek above the fold */
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 0;
          background: rgb(255,255,255);
          border: 1px solid rgba(0,0,0,0.08);
        }
        .info-card {
          padding: 32px;
          border-right: 1px solid rgba(0,0,0,0.08);
          display: flex; flex-direction: column; gap: 8px;
          text-decoration: none;
        }
        .info-card:nth-child(n+2) { padding-left: 16px; }
        .info-card:last-child { border-right: none; }
        .info-label {
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 10.5px; font-weight: 500;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: rgba(0,0,0,0.4);
        }
        .info-value {
          font-family: 'JetBrains Mono', ui-monospace, monospace; font-weight: 500;
          font-size: clamp(18px, 1.9vw, 26px); letter-spacing: -0.02em;
          line-height: 1; color: rgb(0,0,0);
          text-decoration: none;
        }
        .info-value.red { color: rgb(217,44,43); }
        .info-note {
          font-family: 'Recursive', sans-serif;
          font-size: 12px; color: rgba(0,0,0,0.4);
        }

        /* ── Map — full-bleed band under the form ── */
        .contact-map {
          position: relative; overflow: hidden;
          margin-top: var(--space-section);
          height: clamp(420px, 62vh, 720px);
          background: rgb(220,218,214);
        }
        .contact-map iframe {
          width: 100%; height: 100%;
          display: block; border: 0;
          /* Slight desaturation so the map sits quietly behind the badge
             rather than competing with the red/black brand palette. */
          filter: grayscale(0.15) contrast(1.02);
        }
        .contact-map-badge {
          position: absolute; bottom: 24px;
          left: max(12px, calc((100% - 1440px) / 2 + 12px)); /* aligned with the content container */
          display: inline-flex; align-items: center; gap: 8px;
          background: rgb(255,255,255);
          border: 1px solid rgba(0,0,0,0.08);
          padding: 12px 18px;
          border-radius: 4px;
          text-decoration: none;
          box-shadow: 0 8px 24px rgba(0,0,0,0.14);
          transition: color 150ms, border-color 150ms;
        }
        .contact-map-badge:hover { border-color: rgba(217,44,43,0.3); }
        .contact-map-badge-text { display: flex; flex-direction: column; gap: 2px; }
        .contact-map-badge-label {
          font-family: 'Inter', sans-serif;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: rgba(0,0,0,0.4);
        }
        .contact-map-badge-action {
          font-family: 'Inter', sans-serif;
          font-size: 12px; font-weight: 600;
          color: rgb(0,0,0);
        }
        .contact-map-badge:hover .contact-map-badge-action { color: rgb(217,44,43); }

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
          background: rgb(255,255,255);
          border: 1px solid rgba(0,0,0,0.08);
        }
        .about-fact {
          padding: 32px;
          border-right: 1px solid rgba(0,0,0,0.08);
          display: flex; flex-direction: column; gap: 12px;
        }
        .about-fact:last-child { border-right: none; }
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
          .about-fact { border-right: none; border-bottom: 1px solid rgba(0,0,0,0.08); }
          .about-fact:last-child { border-bottom: none; }
          .contact-info-bar { grid-template-columns: 1fr; }
          .info-card { border-right: none; border-bottom: 1px solid rgba(0,0,0,0.08); }
          .info-card:last-child { border-bottom: none; }
          .contact-map { height: 360px; }
        }
      `}</style>

      <div className="contact-page">
        <div className="contact-inner">

          {/* Hero: the quote-request form */}
          <ContactForm searchParams={searchParams} />

          {/* Info bar */}
          <div className="contact-info-bar">
            <a href="tel:0248222298" className="info-card">
              <span className="info-label">Telefon</span>
              <span className="info-value red">0248.222.298</span>
              <span className="info-note">click to call</span>
            </a>
            <a href="mailto:office@zonascule.ro" className="info-card">
              <span className="info-label">Email</span>
              <span className="info-value">office@zonascule.ro</span>
              <span className="info-note">Raspundem in maximum 24 de ore</span>
            </a>
            <div className="info-card">
              <span className="info-label">Program</span>
              <span className="info-value">08:30 – 17:00</span>
              <span className="info-note">Luni – Vineri</span>
            </div>
          </div>
        </div>

        {/* Map — full-bleed */}
        <div className="contact-map">
          <iframe
            src="https://www.google.com/maps?q=44.8576673,24.8794647&z=17&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            title="Zona Scule — Strada Sfânta Vineri 28, Pitești"
          />
          <a
            href="https://www.google.com/maps/place/Strada+Sf%C3%A2nta+Vineri+28,+110024+Pite%C8%99ti/@44.8577653,24.8792311,17z/data=!4m6!3m5!1s0x40b2bc886b7beedf:0xf306c5b64dd18ca6!8m2!3d44.8576673!4d24.8794647!16s%2Fg%2F11hht09gys"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-map-badge"
          >
            <div className="contact-map-badge-text">
              <span className="contact-map-badge-label">Sfanta Vineri 28, Pitesti</span>
              <span className="contact-map-badge-action">Deschide în Google Maps ↗</span>
            </div>
          </a>
        </div>

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
                <span className="about-fact-value">08:30–17:00</span>
                <span className="about-fact-label">Luni – Vineri, Strada Sfânta Vineri 28, Pitești</span>
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
