import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Despre Noi — Zona Scule',
  description: 'Technology Production SRL (Zona Scule) este distribuitor autorizat de scule profesionale cu peste 26 de ani de experiență în România.',
}

export default function DespreNoiPage() {
  return (
    <>
      <Nav />
      <style>{`
        .about-page {
          padding-top: 96px;
          min-height: 100vh;
        }
        .about-inner {
          max-width: 1440px; margin: 0 auto;
          padding: 80px 12px 96px;
        }
        .about-eyebrow {
          font-family: 'Inter', sans-serif;
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: rgba(0,0,0,0.4);
          margin-bottom: 16px;
        }
        .about-title {
          font-family: 'Neuton', serif;
          font-size: clamp(44px, 6vw, 80px);
          line-height: 1.05;
          color: rgb(0,0,0);
          max-width: 780px;
          margin-bottom: 24px;
        }
        .about-title .red { color: rgb(217,44,43); }
        .about-lead {
          font-family: 'Recursive', sans-serif;
          font-size: 17px; line-height: 1.6; color: rgba(0,0,0,0.6);
          max-width: 620px;
          margin-bottom: 64px;
        }
        .about-facts {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 0;
          background: rgb(255,255,255);
          border: 1px solid rgba(0,0,0,0.08);
          margin-bottom: 64px;
        }
        .about-fact {
          padding: 32px;
          border-right: 1px solid rgba(0,0,0,0.08);
        }
        .about-fact:last-child { border-right: none; }
        .about-fact-value {
          font-family: 'Neuton', serif;
          font-size: 40px; line-height: 1; color: rgb(217,44,43);
          margin-bottom: 8px;
        }
        .about-fact-label {
          font-family: 'Recursive', sans-serif;
          font-size: 13px; color: rgba(0,0,0,0.5);
        }
        .about-contact-cta {
          display: inline-flex; align-items: center;
          background: rgb(217,44,43); color: rgb(255,255,255);
          padding: 14px 32px;
          font-family: 'Inter', sans-serif;
          font-size: 12px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          text-decoration: none; border-radius: 4px;
          transition: background 150ms;
        }
        .about-contact-cta:hover { background: rgb(190,35,34); }

        @media (max-width: 768px) {
          .about-inner { padding: 48px 12px 64px; }
          .about-facts { grid-template-columns: 1fr; }
          .about-fact { border-right: none; border-bottom: 1px solid rgba(0,0,0,0.08); }
          .about-fact:last-child { border-bottom: none; }
        }
      `}</style>

      <div className="about-page">
        <div className="about-inner">
          <p className="about-eyebrow">Pitești, Argeș, România</p>
          <h1 className="about-title">
            Distribuitor autorizat de <span className="red">scule profesionale</span>, de peste 26 de ani.
          </h1>
          <p className="about-lead">
            Technology Production SRL (Zona Scule) furnizează scule electrice, industriale
            și de construcții pentru profesioniști și ateliere din toată țara.
          </p>

          <div className="about-facts">
            <div className="about-fact">
              <div className="about-fact-value">26+</div>
              <div className="about-fact-label">Ani de experiență pe piața din România</div>
            </div>
            <div className="about-fact">
              <div className="about-fact-value">S.E.A.P.</div>
              <div className="about-fact-label">Furnizor înregistrat pentru achiziții publice</div>
            </div>
            <div className="about-fact">
              <div className="about-fact-value">08:30–17:00</div>
              <div className="about-fact-label">Luni – Vineri, Strada Sfânta Vineri 28, Pitești</div>
            </div>
          </div>

          <Link href="/contact" className="about-contact-cta">Contactează-ne</Link>
        </div>
      </div>
      <Footer />
    </>
  )
}
