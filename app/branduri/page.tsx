import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { getBrands } from '@/lib/supabase'
import { getBrandHref } from '@/lib/brand-content'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Branduri — Toți Producătorii | Zona Scule',
  description: 'Toate brandurile disponibile în catalogul Zona Scule — de la Bosch și Milwaukee la Karcher, PFERD, Osborn și RUKO.',
}

export default async function BranduriPage() {
  const brands = await getBrands()

  return (
    <>
      <Nav />
      <style>{`
        .branduri-page {
          padding-top: 52px;
          min-height: 100vh;
        }
        .branduri-inner {
          max-width: 1440px; margin: 0 auto;
          padding: 64px 12px 96px;
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
        .branduri-card-name {
          font-family: 'Inter', sans-serif;
          font-size: 15px; font-weight: 600;
          color: rgb(0,0,0);
        }
        .branduri-card-count {
          font-family: 'Recursive', sans-serif;
          font-size: 12px; color: rgba(0,0,0,0.4);
        }
      `}</style>

      <div className="branduri-page">
        <div className="branduri-inner">
          <h1 className="branduri-title">Branduri</h1>
          <p className="branduri-sub">{brands.length} producători disponibili în catalog.</p>
          <div className="branduri-grid">
            {brands.map(b => (
              <Link key={b.id} href={getBrandHref(b.name)} className="branduri-card">
                <span className="branduri-card-name">{b.name}</span>
                <span className="branduri-card-count">{b.product_count.toLocaleString('ro')} produse</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
