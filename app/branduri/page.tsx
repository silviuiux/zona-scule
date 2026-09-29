import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'
import { getBrands, getRandomExpensiveProductsByBrand, getBrandSubcategoryNames } from '@/lib/supabase'
import { getBrandHref, getBrandLogo, getBrandBanner } from '@/lib/brand-content'
import StoryMotion from '@/app/zona-solutii/StoryMotion'
import { SOLUTIONS_CSS, STORY_CSS } from '@/app/zona-solutii/styles'
import { editorial, stagger } from '@/app/zona-solutii/editorial'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Zona Branduri — toți producătorii | Zona Scule',
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
  const { chapter, fullBleed } = editorial()

  return (
    <>
      <Nav />
      <style>{SOLUTIONS_CSS + STORY_CSS + `
        .branduri-page {
          padding-top: var(--nav-h);
          min-height: 100vh;
        }
        .branduri-inner {
          max-width: 1440px; margin: 0 auto;
          padding: 0 var(--gutter) var(--space-section);
        }
        /* Hero — the same quiet first screen as the stories and the catalog */
        .branduri-hero {
          min-height: calc(88vh - var(--nav-h));
          display: flex; flex-direction: column; justify-content: flex-end;
          padding: clamp(72px, 12vh, 128px) 0 clamp(72px, 11vh, 128px);
        }
        .branduri-hero .eyebrow-mono { margin-bottom: 28px; }
        .branduri-hero .zs-title { margin-bottom: 40px; }
        .branduri-hero .zs-sub { margin-bottom: 40px; }
        .branduri-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          grid-auto-flow: dense; /* backfill the holes the wide cards leave */
          gap: 16px;
          margin-bottom: var(--space-section);
        }
        .branduri-card {
          position: relative; overflow: hidden;
          display: flex; flex-direction: column; justify-content: flex-end; gap: 8px;
          min-height: 260px;
          padding: 28px 28px 64px;
          background: rgb(255,255,255);
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 4px;
          text-decoration: none;
          transition: border-color 200ms, box-shadow 300ms, transform 300ms cubic-bezier(0.2, 0.7, 0.1, 1);
        }
        .branduri-card:hover { border-color: rgba(0,0,0,0.16); box-shadow: 0 16px 40px rgba(0,0,0,0.07); transform: translateY(-3px); }
        /* every mark in the same 160×48 box, top-left */
        .branduri-card-mark { width: 160px; height: 48px; margin-bottom: auto; display: flex; align-items: center; }
        .branduri-card-logo { display: block; width: auto; height: auto; max-width: 100%; max-height: 100%; object-fit: contain; }
        /* Featured (logo) brands span two columns */
        .branduri-card.wide { grid-column: span 2; }
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
          font-family: 'Neuton', serif; font-weight: 400;
          font-size: 30px; line-height: 1; letter-spacing: -0.01em;
          color: rgb(0,0,0);
        }
        .branduri-card.wide .branduri-card-name { font-size: 36px; }
        .branduri-card-count {
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 10.5px; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(0,0,0,0.4);
        }
        .branduri-card:hover .branduri-card-name { color: rgb(217,44,43); }

        .branduri-grid { margin-bottom: 0; }
        .branduri-promoted .zs-bleed { margin-top: 0; }
        .branduri-promoted .zs-scroll { margin-top: 40px; }
        @media (max-width: 900px) {
          .branduri-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
      `}</style>

      <StoryMotion />
      <div className="zs-progress" aria-hidden="true"><span /></div>
      <main className="branduri-page zs-story">
        <div className="branduri-inner">
          <header className="branduri-hero">
            <span className="eyebrow-mono" data-reveal>Producători</span>
            <h1 className="zs-title" data-reveal style={stagger(1)}><span className="red">Zona</span><br />Branduri</h1>
            <p className="zs-sub" data-reveal style={stagger(2)}>
              Scule electrice, abrazive, accesorii și echipamente profesionale de la producătorii
              pe care îi distribuim — alege un brand pentru gama completă.
            </p>
            <div className="zs-stats" data-reveal style={stagger(3)}>
              <div className="zs-stat"><span className="zs-stat-num">{brands.length}</span><span className="zs-stat-label">producători</span></div>
              <div className="zs-stat"><span className="zs-stat-num">{totalProducts.toLocaleString('ro')}</span><span className="zs-stat-label">produse</span></div>
            </div>
          </header>

          <section>
            <div className="branduri-grid">
              {brands.map((b, bi) => {
                const logo = getBrandLogo(b.name)
                const subs = tickers[bi]
                return (
                  <Link key={b.id} href={getBrandHref(b.name)} className={`branduri-card${logo ? ' wide' : ''}`} data-reveal style={stagger(bi % 4)}>
                    {logo && (
                      <span className="branduri-card-mark">
                        <Image src={logo.src} alt="" width={logo.width} height={logo.height} className="branduri-card-logo" />
                      </span>
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
          </section>

          {featured.map((b, i) => {
            const group = promotedGroups[i]
            if (group.length === 0) return null
            // The brand's configured application photo, else the first
            // gallery image among the sampled products (closer to an
            // in-context shot than the plain catalog cutout).
            const bannerSrc = getBrandBanner(b.name) ?? group.find(p => p.gallery_url_1)?.gallery_url_1
            return (
              <section key={b.name} className="zs-block branduri-promoted">
                {chapter(`Selecție premium ${b.name}`, undefined, (
                  <Link href={getBrandHref(b.name)} className="zs-car-link">Vezi tot <span aria-hidden="true">→</span></Link>
                ))}
                {bannerSrc && fullBleed({ src: bannerSrc, alt: '', caption: `${b.name} · în lucru` })}
                <div className="zs-scroll" data-reveal>
                  {group.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
              </section>
            )
          })}
        </div>
      </main>
      <Footer />
    </>
  )
}
