import Link from 'next/link'
import Image from 'next/image'
import Nav from '@/components/Nav'
import { getCategoriesWithCount, getBrands } from '@/lib/supabase'
import AnimatedHero from '@/components/AnimatedHero'

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
          padding-top: 60px;
          /* transparent so body dot pattern shows through */
          background: transparent;
          min-height: 82vh;
          display: flex; align-items: center;
          overflow: hidden;
        }
        .hero-inner {
          max-width: 1440px; margin: 0 auto;
          padding: 0 12px;
          width: 100%;
          display: flex; flex-direction: column;
          gap: 26px;
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
          background: rgb(244, 244, 244);
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
          transition: transform 200ms;
        }
        .cat-card:hover { transform: scale(1.01); }
        .cat-card-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 55%);
        }
        .cat-card-label {
          position: absolute; bottom: 16px; left: 16px; right: 16px;
          font-family: 'Recursive', sans-serif;
          font-size: 15px; font-weight: 500;
          color: rgb(255,255,255); letter-spacing: -0.01em;
          line-height: 1.3;
        }
        .cat-card-desc {
          position: absolute; bottom: 38px; left: 16px; right: 16px;
          font-family: 'Recursive', sans-serif;
          font-size: 12px; color: rgba(255,255,255,0.7); line-height: 1.4;
        }

        /* ─── SERVICES ────────────────────────── */
        .services-section {
          max-width: 1440px; margin: 0 auto;
          padding: 0 12px 96px;
          display: flex; flex-direction: column; gap: 64px;
        }
        .services-header {
          display: flex; flex-direction: column; gap: 16px;
          align-items: center; text-align: center;
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
            <div className="hero-search-box">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input placeholder="Cauta scule, branduri, accesorii" readOnly />
            </div>
            <Link href="/produse" className="hero-catalog-cta">
              CATALOG ↗
            </Link>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES — 5 rows × 4 cols ── */}
      <section className="cats-section">
        {[0, 1, 2, 3, 4].map(row => (
          categories.slice(row * 4, row * 4 + 4).length > 0 && (
            <div key={row} className="cats-row">
              {categories.slice(row * 4, row * 4 + 4).map((cat, i) => (
                <Link
                  key={cat.id}
                  href={`/produse?categorie=${encodeURIComponent(cat.name)}`}
                  className="cat-card"
                >
                  {cat.hero_image_url ? (
                    <Image src={cat.hero_image_url} alt={cat.name} fill style={{ objectFit: 'cover' }} unoptimized />
                  ) : (
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: `hsl(${(row * 90 + i * 22) % 360}, 6%, ${74 - i * 2}%)`
                    }} />
                  )}
                  <div className="cat-card-overlay" />
                  {cat.description && <span className="cat-card-desc">{cat.description}</span>}
                  <span className="cat-card-label">{cat.name}</span>
                </Link>
              ))}
            </div>
          )
        ))}
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
