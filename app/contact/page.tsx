import Nav from '@/components/Nav'
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
          max-width: 1440px; margin: 0 auto;
          padding: 80px 102px 96px;
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
          margin-bottom: 80px;
        }
        .info-card {
          padding: 28px 32px;
          border-right: 1px solid rgba(0,0,0,0.08);
          display: flex; flex-direction: column; gap: 6px;
          text-decoration: none;
        }
        .info-card:last-child { border-right: none; }
        .info-label {
          font-family: 'Inter', sans-serif;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
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
        .contact-photo img {
          width: 100%; height: 100%;
          object-fit: cover; object-position: center top;
          display: block;
        }

        @media (max-width: 1100px) {
          .contact-inner { padding: 64px 40px 80px; }
        }
        @media (max-width: 768px) {
          .contact-inner { padding: 48px 16px 64px; }
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
              <img src="/service-garantie.avif" alt="Zona Scule" />
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
