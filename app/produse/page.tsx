import Nav from '@/components/Nav'
import ProductCard from '@/components/ProductCard'
import { getProducts, getCategoriesWithCount, getBrands } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'
import LoadMore from './LoadMore'
import SubcategoryBar from './SubcategoryBar'
import Sidebar from './Sidebar'
import { MobileFilterToggle, MobileFilterBackdrop } from './MobileFilterDrawer'

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
  // Find the active category record so we can render its hero banner image.
  const activeCategory = sp.categorie
    ? categories.find(c => c.name.toLowerCase() === sp.categorie!.toLowerCase())
    : null
  const headerTitle = sp.categorie ?? sp.brand ?? sp.q ?? ''

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
          max-width: 1600px; margin: 0 auto;
          padding: 48px 24px 96px;
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
        /* ─── Category hero banner (above the filtered layout) ─── */
        .cat-hero {
          width: 100%;
          height: clamp(140px, 15vh, 220px);
          overflow: hidden;
          position: relative;
          background: rgba(0,0,0,0.04);
        }
        /* Parallax: banner scrolls at 40% of page speed.
           --cat-banner-y = +0.6 * scrollY (downward translate) means the image
           appears to scroll up only 40% as fast as the page. The image is
           taller than its container with 200px of buffer above and below so
           the edges never reveal background during the translation. */
        .cat-hero-img {
          position: absolute;
          top: -200px;
          left: 0; right: 0;
          width: 100%;
          height: calc(100% + 400px);
          object-fit: cover;
          object-position: center;
          display: block;
          transform: translate3d(0, var(--cat-banner-y, 0px), 0);
          will-change: transform;
        }
        @media (prefers-reduced-motion: reduce) {
          .cat-hero-img { transform: none; }
        }

        /* ─── Filtered layout ─── */
        .filtered-layout {
          display: flex; max-width: 1600px; margin: 0 auto;
        }
        /* Page title: single-line ALL CAPS for filtered views */
        .filtered-title {
          font-family: 'Bungee', sans-serif;
          font-size: clamp(40px, 5vw, 72px);
          line-height: 1; color: rgb(0,0,0);
          text-transform: uppercase;
          letter-spacing: 0.005em;
          margin: 0;
        }
        /* Desktop sidebar dimensions live here; visual styling is owned by
           components/Sidebar.tsx. Mobile drawer overrides are below. */
        .sidebar {
          width: 280px; flex-shrink: 0;
          padding: 32px 16px 40px 24px;
          border-right: 1px solid rgba(0,0,0,0.08);
          position: sticky; top: 52px;
          height: calc(100vh - 52px);
          overflow-y: auto;
        }
        /* Products area */
        .products-main { flex: 1; padding: 32px 32px 80px; min-width: 0; }
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

        /* ── MOBILE SIDEBAR DRAWER ── */
        .sidebar-toggle {
          display: none;
        }
        .sidebar-backdrop {
          display: none;
        }

        @media (max-width: 768px) {
          /* Sidebar becomes an off-canvas drawer */
          .filtered-layout { flex-direction: column; }

          .sidebar {
            position: fixed; top: 0; left: 0; bottom: 0;
            width: 280px; z-index: 200;
            transform: translateX(-100%);
            transition: transform 300ms ease;
            height: 100vh; top: 0;
            padding-top: 72px;
            background: rgb(244,244,244);
            box-shadow: 4px 0 24px rgba(0,0,0,0.12);
          }
          .sidebar.open {
            transform: translateX(0);
          }
          .sidebar-backdrop {
            display: block;
            position: fixed; inset: 0; z-index: 199;
            background: rgba(0,0,0,0.4);
            opacity: 0; pointer-events: none;
            transition: opacity 300ms;
          }
          .sidebar-backdrop.open {
            opacity: 1; pointer-events: all;
          }
          .sidebar-toggle {
            display: flex; align-items: center; gap: 8px;
            background: rgb(255,255,255);
            border: 1px solid rgba(0,0,0,0.12);
            border-radius: 4px;
            padding: 8px 14px;
            font-family: 'Recursive', sans-serif;
            font-size: 13px; font-weight: 500; color: rgb(0,0,0);
            cursor: pointer; margin-bottom: 16px;
          }

          /* Product grid responsive */
          .products-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .products-main { padding: 20px 12px 60px; }

          /* Cat grid on unfiltered page */
          .cat-grid-4 { grid-template-columns: repeat(2, 1fr) !important; }
        }

        @media (max-width: 480px) {
          .products-grid { grid-template-columns: 1fr; }
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

        {/* ── Filtered view ── */}
        {isFiltered && (
          <>
            {/* Full-width category hero banner */}
            {activeCategory?.hero_image_url && (
              <div className="cat-hero">
                <img
                  src={activeCategory.hero_image_url}
                  alt={activeCategory.name}
                  className="cat-hero-img"
                />
              </div>
            )}

            <div className="filtered-layout">
              {/* Mobile sidebar backdrop */}
              <MobileFilterBackdrop />
              <Sidebar
                categories={categories}
                brands={brands}
                activeCat={sp.categorie}
                activeSub={sp.subcategorie}
                activeBrand={sp.brand}
              />

              <main className="products-main">
                <div className="products-header">
                  <h1 className="filtered-title">{headerTitle}</h1>
                  {/* Count for brand / search views (no subcategory bar) */}
                  {!sp.categorie && (
                    <span className="products-count">{total.toLocaleString('ro')} produse</span>
                  )}
                </div>
                {/* Mobile filter toggle */}
                <MobileFilterToggle />
                {sp.categorie && (
                  <SubcategoryBar
                    categoryName={sp.categorie}
                    activeSub={sp.subcategorie}
                    total={activeCategory?.product_count}
                  />
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
          </>
        )}
      </div>
    </>
  )
}
