import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'
import { getBrands, getRandomExpensiveProductsByBrand, getBrandSubcategoryNames } from '@/lib/supabase'
import { getBrandHref, getBrandLogo } from '@/lib/brand-content'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Branduri — Toți Producătorii | Zona Scule',
  description: 'Toate brandurile disponibile în catalogul Zona Scule — de la Bosch și Milwaukee la Karcher, PFERD, Osborn și RUKO.',
}

// Featured brands — for now, the ones with a logo (see getBrandLogo) —
// span two columns in the grid and each get a "premium picks" section: a
// tall banner above a random sample of that brand's most expensive products
// (getRandomExpensiveProductsByBrand, matched on products.brand_name).
export default async function BranduriPage() {
  const brands = await getBrands()
  const featured = brands.filter(b => getBrandLogo(b.name))
  const [promotedGroups, tickers] = await Promise.all([
    Promise.all(featured.map(b => getRandomExpensiveProductsByBrand(b.name, { poolSize: 40, count: 24 }))),
    Promise.all(brands.map(b => getBrandSubcategoryNames(b.name))),
  ])
  const totalProducts = brands.reduce((n, b) => n + b.product_count, 0)

  return (
    <>
      <Nav />
      <style>{`
        .branduri-page {
          padding-top: var(--nav-h);
          min-height: 100vh;
        }
        .branduri-inner {
          max-width: 1440px; margin: 0 auto;
          padding: 0 var(--gutter) var(--space-section);
        }
        /* Hero — same rhythm as the catalog / contact heroes: roomy top,
           mono eyebrow, big Neuton title, short description, mono stats */
        .branduri-hero { padding: clamp(72px, 12vh, 128px) 0 clamp(56px, 8vh, 96px); }
        .branduri-hero .eyebrow-mono { margin-bottom: 20px; }
        .branduri-title {
          font-family: 'Neuton', serif; font-weight: 400;
          font-size: clamp(56px, 7.5vw, 112px);
          line-height: 0.92; letter-spacing: -0.015em;
          color: rgb(0,0,0);
          margin-bottom: 24px;
        }
        .branduri-sub {
          font-family: 'Recursive', sans-serif;
          font-size: 16px; line-height: 1.6; color: rgba(0,0,0,0.55);
          max-width: 560px;
          margin-bottom: 32px;
        }
        .branduri-stats { display: flex; gap: 32px; flex-wrap: wrap; }
        .branduri-stat { display: flex; align-items: baseline; gap: 8px; }
        .branduri-stat-num { font-family: 'JetBrains Mono', ui-monospace, monospace; font-weight: 500; font-size: 22px; letter-spacing: -0.02em; color: rgb(0,0,0); }
        .branduri-stat-label { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10.5px; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(0,0,0,0.4); }
        .branduri-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          grid-auto-flow: dense; /* backfill the holes the wide cards leave */
          gap: 16px;
          margin-bottom: var(--space-section);
        }
        .branduri-card {
          position: relative; overflow: hidden;
          display: flex; flex-direction: column; justify-content: flex-end; gap: 6px;
          min-height: 240px;
          padding: 24px 24px 60px;
          background: rgb(255,255,255);
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 6px;
          text-decoration: none;
          transition: border-color 150ms, box-shadow 150ms;
        }
        .branduri-card:hover {
          box-shadow: 0 8px 24px rgba(0,0,0,0.06);
        }
        .branduri-card-logo {
          display: block; height: 48px; width: auto; max-width: 70%;
          object-fit: contain; object-position: left center;
          margin-bottom: auto; /* logo at the top, name + count at the bottom */
        }
        /* Featured (logo) brands span two columns */
        .branduri-card.wide { grid-column: span 2; }
        .branduri-card.wide .branduri-card-logo { height: 72px; max-width: 55%; }
        .branduri-card.wide .branduri-card-name { font-size: 18px; }

        /* Subcategory ticker — slides in along the card's bottom edge on
           hover and scrolls the brand's subcategories, biggest first */
        .bt-ticker {
          position: absolute; left: 0; right: 0; bottom: 0; height: 40px;
          border-top: 1px solid rgba(0,0,0,0.06);
          overflow: hidden;
          display: flex; align-items: center;
          opacity: 0; transform: translateY(100%);
          transition: opacity 250ms ease, transform 350ms cubic-bezier(0.22,1,0.36,1);
          -webkit-mask-image: linear-gradient(90deg, transparent, #000 24px, #000 calc(100% - 24px), transparent);
                  mask-image: linear-gradient(90deg, transparent, #000 24px, #000 calc(100% - 24px), transparent);
        }
        .bt-track {
          display: flex; flex-shrink: 0; white-space: nowrap;
          animation: bt-scroll var(--bt-dur, 30s) linear infinite;
          animation-play-state: paused;
        }
        .bt-item {
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 10.5px; letter-spacing: 0.1em; text-transform: uppercase;
          color: rgba(0,0,0,0.5);
          padding: 0 14px;
        }
        .bt-item::after { content: '·'; margin-left: 28px; color: rgb(217,44,43); }
        @keyframes bt-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .branduri-card:hover .bt-ticker, .branduri-card:focus-visible .bt-ticker { opacity: 1; transform: none; }
        .branduri-card:hover .bt-track, .branduri-card:focus-visible .bt-track { animation-play-state: running; }
        @media (hover: none) {
          .bt-ticker { opacity: 1; transform: none; }
          .bt-track { animation-play-state: running; }
        }
        @media (prefers-reduced-motion: reduce) { .bt-track { animation: none; } }
        .branduri-card-name {
          font-family: 'Inter', sans-serif;
          font-size: 15px; font-weight: 600;
          color: rgb(0,0,0);
        }
        .branduri-card-count {
          font-family: 'Recursive', sans-serif;
          font-size: 12px; color: rgba(0,0,0,0.4);
        }

        /* ── Promoted brand widgets (banner + carousel) ── */
        .branduri-promoted { margin-bottom: var(--space-section); }
        .branduri-promoted:last-child { margin-bottom: 0; }
        .branduri-promoted-banner {
          position: relative; width: 100%; height: 55vh; min-height: 320px; max-height: 620px;
          border-radius: 10px; overflow: hidden; margin-bottom: 40px;
          background: rgb(238,238,238);
        }
        /* Logo, title and link sit in three corners of the banner: logo
           top-left (no backdrop), title bottom-left and link bottom-right on
           solid plates. */
        .branduri-promoted-banner > * { z-index: 1; }
        .branduri-promoted-banner > img { z-index: 0; }
        .branduri-promoted-logo {
          position: absolute; top: 24px; left: 24px;
          display: block; height: 40px; width: auto; max-width: 40%;
          object-fit: contain; object-position: left center;
        }
        .branduri-promoted-title {
          position: absolute; left: 24px; bottom: 24px; max-width: calc(100% - 280px);
          margin: 0; padding: 14px 20px 16px;
          background: rgb(255,255,255); border-radius: 4px;
          font-family: 'Neuton', serif; font-weight: 400;
          font-size: clamp(28px, 3vw, 44px); line-height: 1; letter-spacing: -0.015em;
          color: rgb(0,0,0);
        }
        .branduri-promoted-link {
          position: absolute; right: 24px; bottom: 24px;
          display: inline-flex; align-items: center; gap: 10px;
          height: 48px; padding: 0 20px;
          background: rgb(0,0,0); color: rgb(255,255,255); border-radius: 4px;
          font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          text-decoration: none; transition: background 150ms;
        }
        .branduri-promoted-link:hover { background: rgb(217,44,43); }
        .branduri-promoted-scroll {
          display: flex; gap: 16px; overflow-x: auto; padding-bottom: 6px;
          scroll-snap-type: x mandatory; scrollbar-width: thin;
        }
        .branduri-promoted-scroll > * { flex: 0 0 240px; scroll-snap-align: start; }

        .branduri-grid-title {
          font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 700;
          color: rgb(0,0,0); margin-bottom: 14px;
        }
        @media (max-width: 900px) {
          .branduri-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 768px) {
          .branduri-promoted-banner { height: 40vh; min-height: 260px; margin-bottom: 24px; }
          .branduri-promoted-logo { height: 28px; top: 16px; left: 16px; }
          .branduri-promoted-title { left: 16px; bottom: 76px; max-width: calc(100% - 32px); font-size: 26px; padding: 10px 14px 12px; }
          .branduri-promoted-link { left: 16px; right: auto; bottom: 16px; height: 44px; }
        }
      `}</style>

      <div className="branduri-page">
        <div className="branduri-inner">
          <section className="branduri-hero">
            <span className="eyebrow-mono">Producători</span>
            <h1 className="branduri-title">Branduri</h1>
            <p className="branduri-sub">
              Scule electrice, abrazive, accesorii și echipamente profesionale de la producătorii
              pe care îi distribuim — alege un brand pentru gama completă.
            </p>
            <div className="branduri-stats">
              <div className="branduri-stat"><span className="branduri-stat-num">{brands.length}</span><span className="branduri-stat-label">producători</span></div>
              <div className="branduri-stat"><span className="branduri-stat-num">{totalProducts.toLocaleString('ro')}</span><span className="branduri-stat-label">produse</span></div>
            </div>
          </section>

          <h2 className="branduri-grid-title">Toate brandurile</h2>
          <div className="branduri-grid">
            {brands.map((b, bi) => {
              const logo = getBrandLogo(b.name)
              const subs = tickers[bi]
              return (
                <Link key={b.id} href={getBrandHref(b.name)} className={`branduri-card${logo ? ' wide' : ''}`}>
                  {logo && (
                    <Image
                      src={logo.src}
                      alt=""
                      width={logo.width}
                      height={logo.height}
                      className="branduri-card-logo"
                    />
                  )}
                  <span className="branduri-card-name">{b.name}</span>
                  <span className="branduri-card-count">{b.product_count.toLocaleString('ro')} produse</span>
                  {subs.length > 0 && (
                    <div className="bt-ticker" aria-hidden="true">
                      <div className="bt-track" style={{ ['--bt-dur' as string]: `${Math.max(14, subs.join('').length * 0.28)}s` }}>
                        {[...subs, ...subs].map((name, i) => <span key={i} className="bt-item">{name}</span>)}
                      </div>
                    </div>
                  )}
                </Link>
              )
            })}
          </div>

          {featured.map((b, i) => {
            const group = promotedGroups[i]
            if (group.length === 0) return null
            // Banner is deliberately NOT the main product shot — the first
            // gallery/alt image found among the sampled products, closer to
            // an in-context/application photo than a plain catalog cutout.
            // With none, the banner keeps its plain grey ground so the logo,
            // title and link still have a home.
            const bannerProduct = group.find(p => p.gallery_url_1)
            const logo = getBrandLogo(b.name)
            return (
              <div key={b.name} className="branduri-promoted">
                <div className="branduri-promoted-banner">
                  {bannerProduct?.gallery_url_1 && (
                    <Image
                      src={bannerProduct.gallery_url_1}
                      alt=""
                      fill
                      sizes="100vw"
                      style={{ objectFit: 'cover' }}
                    />
                  )}
                  {logo && (
                    <Image src={logo.src} alt={logo.alt ?? b.name} width={logo.width} height={logo.height} className="branduri-promoted-logo" />
                  )}
                  <h2 className="branduri-promoted-title">Selecție premium {b.name}</h2>
                  <Link href={getBrandHref(b.name)} className="branduri-promoted-link">Vezi tot <span aria-hidden="true">→</span></Link>
                </div>
                <div className="branduri-promoted-scroll">
                  {group.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <Footer />
    </>
  )
}
