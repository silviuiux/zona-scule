import Nav from '@/components/Nav'
import ProductCard from '@/components/ProductCard'
import { getProducts, getCategoriesWithCount, getBrands } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'
import LoadMore from './LoadMore'
import SubcategoryBar from './SubcategoryBar'

export const dynamic = 'force-dynamic'

type SP = { brand?: string; categorie?: string; subcategorie?: string; q?: string; p?: string }

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams
  const pageSize = 100

  const [{ products, total }, categories, brands] = await Promise.all([
    getProducts({ page: 1, pageSize, brandName: sp.brand, categoryText: sp.categorie, subcategoryText: sp.subcategorie, search: sp.q }),
    getCategoriesWithCount(),
    getBrands(),
  ])

  const isFiltered = !!(sp.brand || sp.categorie || sp.q)

  return (
    <>
      <Nav />
      <style>{`
        .catalog-page {
          padding-top: 52px;
          background: rgb(244, 244, 244);
          min-height: 100vh;
        }
        /* ─── Unfiltered photo grid ─── */
        .cat-grid-page {
          max-width: 1440px; margin: 0 auto;
          padding: 48px 12px 96px;
        }
        .page-title {
          font-family: 'Bungee', sans-serif;
          font-size: clamp(48px, 7vw, 96px);
          line-height: 1; color: rgb(0,0,0);
          text-transform: lowercase; margin-bottom: 16px;
        }
        .page-title .red {
          color: rgb(217,44,43);
          -webkit-text-stroke: 2px rgb(217,44,43);
          -webkit-text-fill-color: transparent;
        }
        .page-desc {
          font-family: 'Recursive', sans-serif;
          font-size: 14px; color: rgba(0,0,0,0.5);
          line-height: 1.6; max-width: 400px; margin-bottom: 40px;
        }
        .cat-grid-4 {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 16px; margin-bottom: 16px;
        }
        .cat-card-pg {
          position: relative; overflow: hidden; border-radius: 8px;
          background: rgb(200,200,200); height: 400px;
          text-decoration: none; display: block;
          transition: transform 200ms;
        }
        .cat-card-pg:hover { transform: scale(1.01); }
        .cat-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 55%); }
        .cat-label {
          position: absolute; bottom: 16px; left: 16px; right: 16px;
          font-family: 'Recursive', sans-serif;
          font-size: 15px; font-weight: 500; color: #fff; letter-spacing: -0.01em;
        }
        .cat-desc-pg {
          position: absolute; bottom: 38px; left: 16px; right: 16px;
          font-family: 'Recursive', sans-serif;
          font-size: 12px; color: rgba(255,255,255,0.7); line-height: 1.4;
        }
        /* ─── Filtered layout ─── */
        .filtered-layout {
          display: flex; max-width: 1440px; margin: 0 auto;
        }
        .sidebar {
          width: 220px; flex-shrink: 0;
          padding: 32px 16px 40px 12px;
          border-right: 1px solid rgba(0,0,0,0.08);
          position: sticky; top: 52px;
          height: calc(100vh - 52px);
          overflow-y: auto;
        }
        .sidebar-section-title {
          font-family: 'Inter', sans-serif;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: rgba(0,0,0,0.35); margin-bottom: 8px;
          padding-left: 8px;
        }
        .sidebar-link {
          display: flex; align-items: center; justify-content: space-between;
          font-family: 'Recursive', sans-serif;
          font-size: 13px; padding: 6px 8px;
          border-radius: 3px; color: rgba(0,0,0,0.6);
          text-decoration: none; transition: color 150ms, background 150ms;
          gap: 8px;
        }
        .sidebar-link:hover { color: rgb(0,0,0); background: rgba(0,0,0,0.04); }
        .sidebar-link.active { color: rgb(217,44,43); background: rgba(217,44,43,0.06); font-weight: 500; }
        /* Count pill */
        .count-pill {
          flex-shrink: 0;
          font-family: 'Inter', sans-serif;
          font-size: 10px; font-weight: 500;
          padding: 2px 6px;
          background: rgba(0,0,0,0.07);
          border-radius: 999px;
          color: rgba(0,0,0,0.4);
          min-width: 22px; text-align: center;
        }
        .sidebar-link.active .count-pill {
          background: rgba(217,44,43,0.12);
          color: rgb(217,44,43);
        }
        /* Products area */
        .products-main { flex: 1; padding: 32px 12px 80px; min-width: 0; }
        .products-header { margin-bottom: 24px; display: flex; align-items: baseline; justify-content: space-between; }
        .products-count {
          font-family: 'Recursive', sans-serif;
          font-size: 13px; color: rgba(0,0,0,0.4);
        }
        /* 4-col fixed grid */
        .products-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 40px;
        }
      `}</style>

      <div className="catalog-page">
        {/* ── Unfiltered: catalog title + photo grid ── */}
        {!isFiltered && (
          <div className="cat-grid-page">
            <h1 className="page-title">
              catalog<br />
              <span className="red">scule</span>
            </h1>
            <p className="page-desc">
              Scule electrice profesionale de la BOSCH, Makita, Stihl si DeWalt. Fiecare produs este selectat pentru performanta industriala.
            </p>
            {Array.from({ length: Math.ceil(categories.length / 4) }).map((_, row) => (
              <div key={row} className="cat-grid-4">
                {categories.slice(row * 4, row * 4 + 4).map((cat, i) => (
                  <Link key={cat.id} href={`/produse?categorie=${encodeURIComponent(cat.name)}`} className="cat-card-pg">
                    {cat.hero_image_url ? (
                      <Image src={cat.hero_image_url} alt={cat.name} fill style={{ objectFit: 'cover' }} unoptimized />
                    ) : (
                      <div style={{ position: 'absolute', inset: 0, background: `hsl(${row * 60 + i * 25}, 6%, ${72 - i * 3}%)` }} />
                    )}
                    <div className="cat-overlay" />
                    {cat.description && <span className="cat-desc-pg">{cat.description}</span>}
                    <span className="cat-label">{cat.name}</span>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* ── Filtered: sticky sidebar with count pills + 4-col grid ── */}
        {isFiltered && (
          <div className="filtered-layout">
            <aside className="sidebar">
              <p className="sidebar-section-title">Categorii</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', marginBottom: '24px' }}>
                <Link href="/produse" className={`sidebar-link${!sp.categorie && !sp.brand ? ' active' : ''}`}>
                  <span>Toate</span>
                </Link>
                {categories.map(c => (
                  <Link key={c.id} href={`/produse?categorie=${encodeURIComponent(c.name)}`}
                    className={`sidebar-link${sp.categorie === c.name ? ' active' : ''}`}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                    {c.product_count > 0 && (
                      <span className="count-pill">{c.product_count.toLocaleString('ro')}</span>
                    )}
                  </Link>
                ))}
              </div>

              <p className="sidebar-section-title">Branduri</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                {brands.map(b => (
                  <Link key={b.id} href={`/produse?brand=${encodeURIComponent(b.name)}`}
                    className={`sidebar-link${sp.brand === b.name ? ' active' : ''}`}>
                    <span>{b.name}</span>
                  </Link>
                ))}
              </div>
            </aside>

            <main className="products-main">
              <div className="products-header">
                <h1 className="page-title" style={{ fontSize: 'clamp(32px, 4vw, 56px)', marginBottom: 0 }}>
                  zona<br />
                  <span className="red">{sp.categorie ?? sp.brand ?? sp.q}</span>
                </h1>
                <span className="products-count">{total.toLocaleString('ro')} produse</span>
              </div>
              {sp.categorie && (
                <SubcategoryBar categoryName={sp.categorie} activeSub={sp.subcategorie} />
              )}

              {/* 4-col grid — fixed, not auto-fill */}
              <div className="products-grid">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>

              {/* Load More button — client component */}
              {total > pageSize && (
                <LoadMore
                  initialCount={products.length}
                  total={total}
                  filters={{ brand: sp.brand, categorie: sp.categorie, q: sp.q }}
                />
              )}
            </main>
          </div>
        )}
      </div>
    </>
  )
}
