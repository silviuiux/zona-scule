import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import ContactForm from './ContactForm'

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
          background: rgb(244,244,244);
        }
        .contact-inner {
          /* Same max-width + 12px side padding as the nav's own container
             (Nav.tsx .nav-inner) — was 102px, way more inset than the nav,
             which is why this page read as noticeably narrower. */
          max-width: 1440px; margin: 0 auto;
          padding: 80px 12px 96px;
        }

        /* ── Header ── */
        .contact-location {
          font-family: 'Inter', sans-serif;
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: rgba(0,0,0,0.4);
          margin-bottom: 16px;
        }
        .contact-title {
          font-family: 'Bungee', sans-serif;
          font-size: clamp(52px, 7vw, 96px);
          line-height: 0.92;
          text-transform: uppercase;
          margin-bottom: 20px;
        }
        .contact-title .red {
          font-family: 'Bungee Inline', sans-serif;
          color: rgb(217,44,43);
        }
        .contact-sub {
          font-family: 'Recursive', sans-serif;
          font-size: 14px; color: rgba(0,0,0,0.5);
          line-height: 1.6; max-width: 420px;
          margin-bottom: 64px;
        }

        /* ── Info bar ── */
        .contact-info-bar {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 0;
          background: rgb(255,255,255);
          border: 1px solid rgba(0,0,0,0.08);
          margin-bottom: 96px;
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
          font-family: 'Recursive', sans-serif;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: rgba(0,0,0,0.35);
        }
        .info-value {
          font-family: 'Bungee', sans-serif;
          font-size: clamp(20px, 2.2vw, 32px);
          line-height: 1; color: rgb(0,0,0);
          text-decoration: none;
        }
        .info-value.red { color: rgb(217,44,43); }
        .info-note {
          font-family: 'Recursive', sans-serif;
          font-size: 12px; color: rgba(0,0,0,0.4);
        }

        /* ── Form + Photo ── */
        .contact-bottom {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          align-items: stretch;
        }
        .contact-photo {
          position: relative; overflow: hidden;
          background: rgb(220,218,214);
        }
        .contact-photo iframe {
          width: 100%; height: 100%;
          display: block; border: 0;
          /* Slight desaturation so the map sits quietly behind the badge
             rather than competing with the red/black brand palette. */
          filter: grayscale(0.15) contrast(1.02);
        }
        .contact-map-badge {
          position: absolute; left: 16px; bottom: 16px;
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

        @media (max-width: 768px) {
          .contact-inner { padding: 48px 12px 64px; }
          .contact-info-bar { grid-template-columns: 1fr; }
          .info-card { border-right: none; border-bottom: 1px solid rgba(0,0,0,0.08); }
          .info-card:last-child { border-bottom: none; }
          .contact-bottom { grid-template-columns: 1fr; }
          .contact-photo { min-height: 300px; }
        }
      `}</style>

      <div className="contact-page">
        <div className="contact-inner">

          {/* Header */}
          <p className="contact-location">Pitesti, Arges, Romania</p>
          <h1 className="contact-title">
            <span className="red">CONTACT</span><br />
            ZONA SCULE
          </h1>
          <p className="contact-sub">
            Completati formularul si va raspundem in cel mai scurt
            timp cu o oferta personalizata nevoilor dumneavoastra.
          </p>

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

          {/* Form + Photo */}
          <div className="contact-bottom">
            <ContactForm searchParams={searchParams} />
            <div className="contact-photo">
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
          </div>

        </div>
      </div>
      <Footer />
    </>
  )
}
