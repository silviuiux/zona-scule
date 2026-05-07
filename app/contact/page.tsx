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
        }
        /* Same max-width container for everything */
        .contact-inner {
          max-width: 1440px; margin: 0 auto;
          padding: 80px 12px 96px;
        }
        .contact-title {
          font-family: 'Bungee', sans-serif;
          font-size: clamp(48px, 7vw, 96px);
          line-height: 0.92; color: rgb(0,0,0);
          text-transform: uppercase; margin-bottom: 24px;
        }
        .contact-title .red {
          color: rgb(217,44,43);
          -webkit-text-stroke: 2px rgb(217,44,43);
          -webkit-text-fill-color: transparent;
        }
        .contact-sub {
          font-family: 'Recursive', sans-serif;
          font-size: 14px; color: rgba(0,0,0,0.5);
          line-height: 1.6; max-width: 400px; margin-bottom: 48px;
        }
        /* Info cards — same width as form+map below */
        .contact-cards {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 16px; margin-bottom: 16px;
        }
        .contact-card {
          background: rgb(255,255,255);
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 4px; padding: 32px 24px;
          display: flex; flex-direction: column; gap: 8px;
          text-decoration: none; transition: box-shadow 200ms;
        }
        .contact-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .contact-card-label {
          font-family: 'Inter', sans-serif;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: rgba(0,0,0,0.35);
        }
        .contact-card-value {
          font-family: 'Bungee', sans-serif;
          font-size: clamp(18px, 2.5vw, 28px);
          color: rgb(0,0,0); line-height: 1.1;
          letter-spacing: -0.01em;
        }
        /* Form + Map — same grid as cards above */
        .contact-bottom {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 16px; min-height: 600px;
        }
        /* Map */
        .contact-map {
          position: relative; overflow: hidden;
          background: rgb(230,228,224);
          border-radius: 4px; min-height: 500px;
        }
        .contact-map iframe {
          width: 100%; height: 100%; border: none;
        }
      `}</style>

      <div className="contact-page">
        <div className="contact-inner">
          <h1 className="contact-title">
            CONTACT<br />
            <span className="red">ZONA SCULE</span>
          </h1>
          <p className="contact-sub">
            Echipa noastră este disponibilă pentru consultanță,
            oferte personalizate și service. Răspundem în max 24h.
          </p>

          {/* Info cards */}
          <div className="contact-cards">
            <a href="tel:0248222298" className="contact-card">
              <span className="contact-card-label">Telefon</span>
              <span className="contact-card-value">0248.222.298</span>
            </a>
            <a href="mailto:contact@zonascule.ro" className="contact-card">
              <span className="contact-card-label">Email</span>
              <span className="contact-card-value">contact@zonascule.ro</span>
            </a>
            <div className="contact-card">
              <span className="contact-card-label">Showroom</span>
              <span className="contact-card-value">Sf Vineri 28, Pitesti</span>
            </div>
          </div>

          {/* Form + Map — same width as cards */}
          <div className="contact-bottom">
            <ContactForm searchParams={searchParams} />
            <div className="contact-map">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2842.1234567890!2d24.8693!3d44.8561!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40b2bc8b5b5b5b5b%3A0x5b5b5b5b5b5b5b5b!2sStrada%20Sf%C3%A2nta%20Vineri%2028%2C%20Pite%C8%99ti!5e0!3m2!1sro!2sro!4v1620000000000!5m2!1sro!2sro"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Zona Scule Showroom"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
