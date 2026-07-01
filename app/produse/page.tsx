import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'
import { getProducts, getCategoriesWithCount, getBrandsByFilter, getAllSubcategoriesWithCount, getSubcategoriesByBrandName } from '@/lib/supabase'
import LoadMore from './LoadMore'
import SubcategoryBar from './SubcategoryBar'
import Sidebar from './Sidebar'
import { MobileFilterToggle, MobileFilterBackdrop } from './MobileFilterDrawer'

export const dynamic = 'force-dynamic'

/** Fisher-Yates shuffle — server-side, runs fresh each request */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

type SP = { brand?: string; categorie?: string; subcategorie?: string; q?: string }

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams
  // Initial server-rendered batch. Kept small (was 100) so /produse ships a
  // light first payload — the rest streams in via LoadMore. MUST match the
  // pageSize LoadMore requests, or offset pagination skips/dupes products.
  const pageSize = 24
  const isFiltered = !!(sp.brand || sp.categorie || sp.q)

  // Fetch in parallel — all-subs only needed for unfiltered view; brand-subs when brand filter active
  const [{ products: rawProducts, total }, categoriesResult, brands, allSubs, brandSubs] = await Promise.all([
    getProducts({
      page: 1,
      pageSize,
      brandName: sp.brand,
      categoryText: sp.categorie,
      subcategoryText: sp.subcategorie,
      search: sp.q,
    }),
    getCategoriesWithCount(),
    getBrandsByFilter({
      categoryText: sp.categorie,
      subcategoryText: sp.subcategorie,
      search: sp.q,
    }),
    !isFiltered ? getAllSubcategoriesWithCount() : Promise.resolve([]),
    sp.brand && !sp.categorie ? getSubcategoriesByBrandName(sp.brand) : Promise.resolve([]),
  ])

  // Hide the catch-all "Necategorizat" bucket from the sidebar category list
  const categories = categoriesResult.filter(c => c.name.toLowerCase() !== 'necategorizat')

  // Shuffle on "Toate" views (no specific subcategory or search query).
  // Preserves DB order when drilling into a subcategory or searching.
  const products = (sp.subcategorie || sp.q) ? rawProducts : shuffle(rawProducts)

  const activeCategory = sp.categorie
    ? categories.find(c => c.name.toLowerCase() === sp.categorie!.toLowerCase())
    : null

  return (
    <>
      <Nav />
      <style>{`
        /* ── Hero section (white) ── */
        .cat-hero {
          background: rgb(255, 255, 255);
          padding-top: 52px; /* nav height */
          border-bottom: 1px solid rgba(0,0,0,0.07);
        }
        .cat-hero-inner {
          max-width: 1440px;
          margin: 0 auto;
          padding: 112px 12px 56px;
          width: 100%;
        }

        /* Breadcrumb */
        .cat-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 32px;
          flex-wrap: wrap;
        }
        .cat-bc-pill {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(0,0,0,0.45);
          text-decoration: none;
          border: 1px solid rgba(0,0,0,0.18);
          border-radius: 4px;
          padding: 5px 14px;
          transition: color 150ms, border-color 150ms;
          white-space: nowrap;
        }
        .cat-bc-pill:hover { color: rgb(0,0,0); border-color: rgba(0,0,0,0.4); }
        .cat-bc-sep {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          color: rgba(0,0,0,0.25);
        }
        .cat-bc-current {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(0,0,0,0.45);
          white-space: nowrap;
        }

        /* Title */
        .cat-hero-title {
          display: flex;
          flex-direction: column;
          gap: 0;
          margin-bottom: 20px;
          line-height: 1;
        }
        .cat-hero-zona {
          font-family: 'Bungee', sans-serif;
          font-size: clamp(48px, 7vw, 96px);
          color: rgb(217, 44, 43);
          text-transform: uppercase;
          letter-spacing: 0.005em;
          line-height: 1;
        }
        .cat-hero-name {
          font-family: 'Bungee', sans-serif;
          font-size: clamp(48px, 7vw, 96px);
          color: rgb(0, 0, 0);
          text-transform: uppercase;
          letter-spacing: 0.005em;
          line-height: 1;
        }

        /* Description */
        .cat-hero-desc {
          font-family: 'Recursive', sans-serif;
          font-size: 15px;
          color: rgba(0,0,0,0.5);
          line-height: 1.6;
          max-width: 560px;
          margin: 0 0 28px;
        }

        /* Stats */
        .cat-hero-stats {
          display: flex;
          align-items: center;
          gap: 24px;
        }
        .cat-hero-stat {
          display: flex;
          align-items: baseline;
          gap: 8px;
        }
        .cat-hero-stat-num {
          font-family: 'Bungee', sans-serif;
          font-size: 22px;
          color: rgb(0,0,0);
          letter-spacing: 0.02em;
        }
        .cat-hero-stat-label {
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(0,0,0,0.35);
        }
        .cat-hero-stat-div {
          width: 1px;
          height: 20px;
          background: rgba(0,0,0,0.12);
        }

        /* ── Listing section (gray) ── */
        .catalog-page {
          background: rgb(244, 244, 244);
          min-height: 60vh;
          position: relative;
          isolation: isolate;
        }
        .catalog-page::before {
          content: '';
          position: absolute;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          background-image: var(--noise-svg);
          background-repeat: repeat;
          background-size: 200px 200px;
          background-position: 0 var(--noise-y, 0px);
          opacity: 0.08;
          mix-blend-mode: multiply;
        }

        /* ─── Sidebar + grid layout ─── */
        .catalog-layout {
          display: flex; max-width: 1440px; margin: 0 auto; padding: 0 12px;
        }
        .sidebar {
          width: 280px; flex-shrink: 0;
          padding: 32px 16px 40px 24px;
          position: sticky; top: 52px;
          height: calc(100vh - 52px);
          overflow-y: auto;
        }
        .products-main { flex: 1; padding: 32px 32px 80px; min-width: 0; }
        .products-header {
          margin-bottom: 24px;
          display: flex; align-items: center; gap: 16px;
        }
        .products-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 40px;
        }

        /* ── MOBILE SIDEBAR DRAWER ── */
        .sidebar-toggle {
          display: none;
          flex-shrink: 0;
        }
        .sidebar-backdrop { display: none; }

        @media (max-width: 768px) {
          .cat-hero-inner { padding: 80px 12px 40px; }
          .cat-hero-zona, .cat-hero-name { font-size: 40px; }
          .cat-breadcrumb { margin-bottom: 20px; }

          .catalog-layout { flex-direction: column; }
          .sidebar {
            position: fixed; top: 0; left: 0; bottom: 0;
            width: 280px; z-index: 200;
            transform: translateX(-100%);
            transition: transform 300ms ease;
            height: 100vh;
            padding-top: 72px;
            background: rgb(244,244,244);
            box-shadow: 4px 0 24px rgba(0,0,0,0.12);
          }
          .sidebar.open { transform: translateX(0); }
          .sidebar-backdrop {
            display: block;
            position: fixed; inset: 0; z-index: 199;
            background: rgba(0,0,0,0.4);
            opacity: 0; pointer-events: none;
            transition: opacity 300ms;
          }
          .sidebar-backdrop.open { opacity: 1; pointer-events: all; }
          .sidebar-toggle {
            display: flex; align-items: center; justify-content: center;
            flex-shrink: 0;
            width: 44px; height: 44px;
            background: none;
            border: none;
            padding: 0;
            color: rgb(0,0,0);
            cursor: pointer;
          }
          .products-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }
          /* Every 25th card spans 2 rows — bigger hero product */
          .products-grid .pcard-link:nth-child(25n) {
            grid-row: span 2;
          }
          .products-grid .pcard-link:nth-child(25n) .pcard {
            height: 100%;
          }
          .products-grid .pcard-link:nth-child(25n) .pcard-img {
            flex: 1;
            aspect-ratio: auto;
          }
          .products-main { padding: 20px 12px 60px; }
        }
      `}</style>

      {/* ── White hero section ── */}
      <div className="cat-hero">
        <div className="cat-hero-inner">
          {/* Breadcrumb */}
          <nav className="cat-breadcrumb">
            <Link href="/produse" className="cat-bc-pill">Catalog</Link>
            {sp.categorie && (
              <>
                <span className="cat-bc-sep">/</span>
                {sp.subcategorie ? (
                  <Link
                    href={`/produse?categorie=${encodeURIComponent(sp.categorie)}`}
                    className="cat-bc-pill"
                  >
                    {sp.categorie}
                  </Link>
                ) : (
                  <span className="cat-bc-current">{sp.categorie}</span>
                )}
              </>
            )}
            {sp.subcategorie && (
              <>
                <span className="cat-bc-sep">/</span>
                <span className="cat-bc-current">{sp.subcategorie}</span>
              </>
            )}
            {sp.brand && !sp.categorie && (
              <>
                <span className="cat-bc-sep">/</span>
                <span className="cat-bc-current">{sp.brand}</span>
              </>
            )}
            {sp.q && (
              <>
                <span className="cat-bc-sep">/</span>
                <span className="cat-bc-current">Căutare</span>
              </>
            )}
          </nav>

          {/* Title */}
          <div className="cat-hero-title">
            {sp.categorie ? (
              <>
                <span className="cat-hero-zona">ZONA</span>
                <span className="cat-hero-name">{sp.categorie}</span>
              </>
            ) : sp.brand ? (
              <>
                <span className="cat-hero-zona">ZONA</span>
                <span className="cat-hero-name">{sp.brand}</span>
              </>
            ) : sp.q ? (
              <>
                <span className="cat-hero-zona">CĂUTARE</span>
                <span className="cat-hero-name" style={{ fontSize: 'clamp(28px, 4vw, 56px)' }}>
                  &ldquo;{sp.q}&rdquo;
                </span>
              </>
            ) : (
              <>
                <span className="cat-hero-zona">ZONA</span>
                <span className="cat-hero-name">SCULE</span>
              </>
            )}
          </div>

          {/* Description */}
          {activeCategory?.description && (
            <p className="cat-hero-desc">{activeCategory.description}</p>
          )}

          {/* Stats */}
          <div className="cat-hero-stats">
            <div className="cat-hero-stat">
              <span className="cat-hero-stat-num">{total.toLocaleString('ro')}</span>
              <span className="cat-hero-stat-label">Produse</span>
            </div>
            {brands.length > 0 && (
              <>
                <div className="cat-hero-stat-div" />
                <div className="cat-hero-stat">
                  <span className="cat-hero-stat-num">{brands.length}</span>
                  <span className="cat-hero-stat-label">Branduri</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Gray listing section ── */}
      <div className="catalog-page">
        <div className="catalog-layout">
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
              <MobileFilterToggle />
            </div>

            {/* Subcategory bar — category, brand, or all-products view */}
            {sp.categorie ? (
              <SubcategoryBar
                categoryName={sp.categorie}
                brandName={sp.brand}
                activeSub={sp.subcategorie}
                total={activeCategory?.product_count}
              />
            ) : sp.brand && brandSubs.length > 0 ? (
              <SubcategoryBar
                brandName={sp.brand}
                activeSub={sp.subcategorie}
                total={total}
                prefetchedSubs={brandSubs}
              />
            ) : !isFiltered ? (
              <SubcategoryBar
                activeSub={sp.subcategorie}
                total={total}
                prefetchedSubs={allSubs}
              />
            ) : null}

            <div className="products-grid">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>

            {total > pageSize && (
              <LoadMore
                initialCount={products.length}
                total={total}
                filters={{ brand: sp.brand, categorie: sp.categorie, subcategorie: sp.subcategorie, q: sp.q }}
              />
            )}
          </main>
        </div>
      </div>
      <Footer />
    </>
  )
}
