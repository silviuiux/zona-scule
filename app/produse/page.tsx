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
  const pageSize = 100
  const isFiltered = !!(sp.brand || sp.categorie || sp.q)

  // Fetch in parallel — all-subs only needed for unfiltered view; brand-subs when brand filter active
  const [{ products: rawProducts, total }, categories, brands, allSubs, brandSubs] = await Promise.all([
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

  // Shuffle on "Toate" views (no specific subcategory or search query).
  // Preserves DB order when drilling into a subcategory or searching.
  const products = (sp.subcategorie || sp.q) ? rawProducts : shuffle(rawProducts)

  const activeCategory = sp.categorie
    ? categories.find(c => c.name.toLowerCase() === sp.categorie!.toLowerCase())
    : null

  const headerTitle = sp.categorie ?? sp.brand ?? sp.q ?? 'Toate produsele'

  return (
    <>
      <Nav />
      <style>{`
        .catalog-page {
          padding-top: 52px;
          background: rgb(244, 244, 244);
          min-height: 100vh;
          position: relative;
          isolation: isolate;
        }
        /* Noise behind cards — 1/3 density, parallax at 90% scroll speed.
           background-position shifts -10% of scrollY via --noise-y so the
           tiled pattern drifts slightly slower than the foreground. */
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

        /* ─── Top spacer (replaces image banner) ─── */
        .cat-spacer {
          width: 100%;
          height: 64px;
        }

        /* ─── Sidebar + grid layout ─── */
        .catalog-layout {
          display: flex; max-width: 1440px; margin: 0 auto; padding: 0 12px;
        }
        .page-title {
          font-family: 'Bungee', sans-serif;
          font-size: clamp(40px, 5vw, 72px);
          line-height: 1; color: rgb(0,0,0);
          text-transform: uppercase;
          letter-spacing: 0.005em;
          margin: 0;
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
        .products-count {
          font-family: 'Recursive', sans-serif;
          font-size: 13px; color: rgba(0,0,0,0.4);
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
          /* Products-header fallback toggle (no-hero pages, e.g. brand filter) */
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
          .page-title { font-size: 24px; }
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

      <div className="catalog-page">
        {/* Top spacer — replaces image banner */}
        <div className="cat-spacer" />

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
              <h1 className="page-title">{headerTitle}</h1>
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
