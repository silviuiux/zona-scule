import Nav from '@/components/Nav'
import ProductCard from '@/components/ProductCard'
import { getProducts, getCategoriesWithCount, getBrandsByFilter, getAllSubcategoriesWithCount } from '@/lib/supabase'
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

  // Fetch in parallel — all-subs only needed for unfiltered view
  const [{ products: rawProducts, total }, categories, brands, allSubs] = await Promise.all([
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
  ])

  // Random order only for the unfiltered "all products" view
  const products = isFiltered ? rawProducts : shuffle(rawProducts)

  const activeCategory = sp.categorie
    ? categories.find(c => c.name.toLowerCase() === sp.categorie!.toLowerCase())
    : null

  // For the all-products view: pick a random category hero, rotates each request
  const heroCategories = categories.filter(c => c.hero_image_url)
  const randomHero = !isFiltered && heroCategories.length > 0
    ? heroCategories[Math.floor(Math.random() * heroCategories.length)]
    : null

  const heroImageUrl = activeCategory?.hero_image_url ?? randomHero?.hero_image_url ?? null
  const heroAlt = activeCategory?.name ?? randomHero?.name ?? 'Zona Scule'

  const headerTitle = sp.categorie ?? sp.brand ?? sp.q ?? 'Toate produsele'

  return (
    <>
      <Nav />
      <style>{`
        .catalog-page {
          padding-top: 52px;
          background: rgb(244, 244, 244);
          min-height: 100vh;
        }

        /* ─── Category hero banner ─── */
        .cat-hero {
          width: 100%;
          height: clamp(200px, 25vh, 340px);
          overflow: hidden;
          position: relative;
          background: rgba(0,0,0,0.04);
        }
        /* All-products hero is 2x taller */
        .cat-hero.cat-hero-all {
          height: clamp(400px, 50vh, 640px);
        }
        .cat-hero-img {
          position: absolute;
          top: -200px; left: 0; right: 0;
          width: 100%;
          height: calc(100% + 400px);
          object-fit: cover; object-position: center;
          display: block;
          transform: translate3d(0, var(--cat-banner-y, 0px), 0);
          will-change: transform;
        }
        @media (prefers-reduced-motion: reduce) {
          .cat-hero-img { transform: none; }
        }

        /* ─── Sidebar + grid layout ─── */
        .catalog-layout {
          display: flex; max-width: 1600px; margin: 0 auto;
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
          border-right: 1px solid rgba(0,0,0,0.08);
          position: sticky; top: 52px;
          height: calc(100vh - 52px);
          overflow-y: auto;
        }
        .products-main { flex: 1; padding: 32px 32px 80px; min-width: 0; }
        .products-header {
          margin-bottom: 24px;
          display: flex; align-items: baseline;
          justify-content: space-between;
        }
        .products-count {
          font-family: 'Recursive', sans-serif;
          font-size: 13px; color: rgba(0,0,0,0.4);
        }
        .products-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 40px;
        }

        /* ── MOBILE SIDEBAR DRAWER ── */
        .sidebar-toggle { display: none; }
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
          .products-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .products-main { padding: 20px 12px 60px; }
          .cat-hero.cat-hero-all { height: clamp(220px, 35vh, 380px); }
        }

        @media (max-width: 480px) {
          .products-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="catalog-page">
        {/* Hero banner — category hero or random rotating hero for all-products view */}
        {heroImageUrl && (
          <div className={`cat-hero${!isFiltered ? ' cat-hero-all' : ''}`}>
            <img
              src={heroImageUrl}
              alt={heroAlt}
              className="cat-hero-img"
            />
          </div>
        )}

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
              <h1 className="page-title">{headerTitle}</h1>
            </div>

            <MobileFilterToggle />

            {/* Subcategory bar — category subs OR all subs in unfiltered view */}
            {sp.categorie ? (
              <SubcategoryBar
                categoryName={sp.categorie}
                activeSub={sp.subcategorie}
                total={activeCategory?.product_count}
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
                filters={{ brand: sp.brand, categorie: sp.categorie, q: sp.q }}
              />
            )}
          </main>
        </div>
      </div>
    </>
  )
}
