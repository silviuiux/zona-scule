import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'
import { getBrands, getRandomExpensiveProductsByBrand } from '@/lib/supabase'
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
  const promotedGroups = await Promise.all(featured.map(b => getRandomExpensiveProductsByBrand(b.name)))

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
          padding: 64px var(--gutter) 96px;
        }
        .branduri-title {
          font-family: 'Neuton', serif;
          font-size: clamp(40px, 5vw, 64px);
          line-height: 1.05;
          color: rgb(0,0,0);
          margin-bottom: 12px;
        }
        .branduri-sub {
          font-family: 'Recursive', sans-serif;
          font-size: 15px; color: rgba(0,0,0,0.5);
          margin-bottom: 40px;
        }
        .branduri-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          grid-auto-flow: dense; /* backfill the holes the wide cards leave */
          gap: 16px;
          margin-bottom: var(--space-section);
        }
        .branduri-card {
          display: flex; flex-direction: column; gap: 6px;
          min-height: 150px;
          padding: 20px 22px;
          background: rgb(255,255,255);
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 6px;
          text-decoration: none;
          transition: border-color 150ms, box-shadow 150ms;
        }
        .branduri-card:hover {
          border-color: rgba(217,44,43,0.3);
          box-shadow: 0 8px 24px rgba(0,0,0,0.06);
        }
        .branduri-card-logo {
          display: block; height: 28px; width: auto;
          object-fit: contain; object-position: left center;
          margin-bottom: 4px;
        }
        /* Featured (logo) brands span two columns, logo up front */
        .branduri-card.wide { grid-column: span 2; justify-content: space-between; }
        .branduri-card.wide .branduri-card-logo { height: 44px; max-width: 60%; margin-bottom: 20px; }
        .branduri-card.wide .branduri-card-name { font-size: 17px; }
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
        .branduri-promoted-head {
          display: flex; align-items: flex-end; justify-content: space-between; gap: 24px;
          margin-bottom: 24px;
        }
        .branduri-promoted-heading { display: flex; flex-direction: column; gap: 16px; }
        .branduri-promoted-logo { display: block; height: 36px; width: auto; object-fit: contain; object-position: left center; }
        .branduri-promoted-title {
          font-family: 'Neuton', serif; font-weight: 400;
          font-size: clamp(32px, 3.4vw, 52px); line-height: 1; letter-spacing: -0.015em;
          color: rgb(0,0,0);
        }
        .branduri-promoted-link {
          font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 700;
          letter-spacing: 0.06em; text-transform: uppercase;
          color: rgba(0,0,0,0.4); text-decoration: none;
        }
        .branduri-promoted-link:hover { color: rgb(217,44,43); }
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
          .branduri-promoted-banner { height: 40vh; min-height: 220px; margin-bottom: 24px; }
          .branduri-promoted-logo { height: 28px; }
        }
      `}</style>

      <div className="branduri-page">
        <div className="branduri-inner">
          <h1 className="branduri-title">Branduri</h1>
          <p className="branduri-sub">{brands.length} producători disponibili în catalog.</p>

          <h2 className="branduri-grid-title">Toate brandurile</h2>
          <div className="branduri-grid">
            {brands.map(b => {
              const logo = getBrandLogo(b.name)
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
            // Skips the banner (keeps the carousel) if none of them have one.
            const bannerProduct = group.find(p => p.gallery_url_1)
            const logo = getBrandLogo(b.name)
            return (
              <div key={b.name} className="branduri-promoted">
                {bannerProduct?.gallery_url_1 && (
                  <div className="branduri-promoted-banner">
                    <Image
                      src={bannerProduct.gallery_url_1}
                      alt=""
                      fill
                      sizes="100vw"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                )}
                <div className="branduri-promoted-head">
                  <div className="branduri-promoted-heading">
                    {logo && (
                      <Image src={logo.src} alt={logo.alt ?? b.name} width={logo.width} height={logo.height} className="branduri-promoted-logo" />
                    )}
                    <h2 className="branduri-promoted-title">Selecție premium {b.name}</h2>
                  </div>
                  <Link href={getBrandHref(b.name)} className="branduri-promoted-link">Vezi tot →</Link>
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
