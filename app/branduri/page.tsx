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

// Featured brands get their own "premium picks" widget — a banner image
// above a random sample of that brand's most expensive products (see
// getRandomExpensiveProductsByBrand). `name` must match products.brand_name
// exactly (case-sensitive).
const PROMOTED_BRANDS = [
  { name: 'BOSCH', label: 'Bosch' },
  { name: 'Milwaukee', label: 'Milwaukee' },
  { name: 'Karcher', label: 'Karcher' },
  { name: 'KRAUSE', label: 'Krause' },
]

export default async function BranduriPage() {
  const [brands, promotedGroups] = await Promise.all([
    getBrands(),
    Promise.all(PROMOTED_BRANDS.map(b => getRandomExpensiveProductsByBrand(b.name))),
  ])

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
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 12px;
          margin-bottom: 72px;
        }
        .branduri-card {
          display: flex; flex-direction: column; gap: 6px;
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
        .branduri-promoted { margin-bottom: 64px; }
        .branduri-promoted-banner {
          position: relative; width: 100%; height: 25vh; min-height: 200px; max-height: 340px;
          border-radius: 10px; overflow: hidden; margin-bottom: 16px;
          background: rgb(238,238,238);
        }
        .branduri-promoted-head {
          display: flex; align-items: baseline; justify-content: space-between;
          margin-bottom: 14px;
        }
        .branduri-promoted-title {
          font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 700;
          color: rgb(0,0,0);
        }
        .branduri-promoted-link {
          font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 700;
          letter-spacing: 0.06em; text-transform: uppercase;
          color: rgba(0,0,0,0.4); text-decoration: none;
        }
        .branduri-promoted-link:hover { color: rgb(217,44,43); }
        .branduri-promoted-scroll {
          display: flex; gap: 14px; overflow-x: auto; padding-bottom: 6px;
          scroll-snap-type: x mandatory; scrollbar-width: thin;
        }
        .branduri-promoted-scroll > * { flex: 0 0 240px; scroll-snap-align: start; }

        .branduri-grid-title {
          font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 700;
          color: rgb(0,0,0); margin-bottom: 14px;
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
                <Link key={b.id} href={getBrandHref(b.name)} className="branduri-card">
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

          {PROMOTED_BRANDS.map((b, i) => {
            const group = promotedGroups[i]
            if (group.length === 0) return null
            // Banner is deliberately NOT the main product shot — the first
            // gallery/alt image found among the sampled products, closer to
            // an in-context/application photo than a plain catalog cutout.
            // Skips the banner (keeps the carousel) if none of them have one.
            const bannerProduct = group.find(p => p.gallery_url_1)
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
                  <span className="branduri-promoted-title">{b.label} — selecție premium</span>
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
