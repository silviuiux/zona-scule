import Nav from '@/components/Nav'

export default function ContactPage() {
  return (
    <>
      <Nav />
      <style>{`
        .contact-page {
          padding-top: 52px;
          background: rgb(244,244,244);
          min-height: 100vh;
        }
        .contact-hero {
          max-width: 1440px; margin: 0 auto;
          padding: 80px 12px 48px;
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
        /* Info cards */
        .contact-cards {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 16px; margin-bottom: 64px;
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
        /* Map + Form split */
        .contact-bottom {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 0; min-height: 600px;
        }
        /* Form */
        .contact-form-wrap {
          padding: 48px 12px 64px 12px;
          background: rgb(244,244,244);
        }
        .contact-form {
          max-width: 520px;
          display: flex; flex-direction: column; gap: 16px;
        }
        .form-group { display: flex; flex-direction: column; gap: 6px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .form-label {
          font-family: 'Recursive', sans-serif;
          font-size: 12px; color: rgba(0,0,0,0.5); font-weight: 500;
        }
        .form-input, .form-textarea {
          background: rgb(255,255,255);
          border: 1px solid rgba(0,0,0,0.1);
          border-radius: 3px; padding: 10px 12px;
          font-family: 'Recursive', sans-serif;
          font-size: 13px; color: rgb(0,0,0);
          outline: none; transition: border-color 150ms;
          width: 100%;
        }
        .form-input::placeholder, .form-textarea::placeholder { color: rgba(0,0,0,0.3); }
        .form-input:focus, .form-textarea:focus { border-color: rgb(0,0,0); }
        .form-textarea { resize: vertical; min-height: 100px; }
        .form-submit {
          padding: 14px; background: rgb(0,0,0); color: rgb(255,255,255);
          border: none; border-radius: 3px;
          font-family: 'Inter', sans-serif;
          font-size: 12px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          cursor: pointer; transition: background 150ms;
          margin-top: 8px;
        }
        .form-submit:hover { background: rgb(217,44,43); }
        /* Map */
        .contact-map {
          position: relative; overflow: hidden;
          background: rgb(230,228,224);
        }
        .contact-map iframe {
          width: 100%; height: 100%; border: none;
        }
      `}</style>

      <div className="contact-page">
        <div className="contact-hero">
          <h1 className="contact-title">
            CONTACT<br />
            <span className="red">ZONA SCULE</span>
          </h1>
          <p className="contact-sub">
            Scule electrice profesionale de la BOSCH, Makita,
            Stihl si DeWalt. Fiecare produs este selectat pentru
            performanta industriala.
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
        </div>

        {/* Form + Map */}
        <div className="contact-bottom">
          <div className="contact-form-wrap">
            <form className="contact-form">
              <div className="form-group">
                <label className="form-label">Nume</label>
                <input className="form-input" placeholder="Nae Protopopitoricescoviki" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" placeholder="nae.p@mail.com" />
                </div>
                <div className="form-group">
                  <label className="form-label">Telefon</label>
                  <input className="form-input" type="tel" placeholder="0700 00 00 00" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Companie</label>
                <input className="form-input" placeholder="ProtoAuto" />
              </div>
              <div className="form-group">
                <label className="form-label">Produse de interes</label>
                <input className="form-input" placeholder="Numele produsului sau categoria" />
              </div>
              <div className="form-group">
                <label className="form-label">Mesajul tau</label>
                <textarea className="form-textarea" placeholder="Descrie ce ai nevoie..." />
              </div>
              <button type="submit" className="form-submit">Contact</button>
            </form>
          </div>

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
    </>
  )
}
