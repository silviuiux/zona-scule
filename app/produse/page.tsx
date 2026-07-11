import { TransitionLink as Link } from '@/components/NavigationProgress'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'
import { getProducts, getHomeProducts, getCategoriesWithCount, getBrandsByFilter, getAllSubcategoriesWithCount, getSubcategoriesByBrandName, getSubcategoriesByCategoryName, getRawProductCount } from '@/lib/supabase'
import LoadMore from './LoadMore'
import SubcategoryBar from './SubcategoryBar'
import Sidebar from './Sidebar'
import CatalogDropdowns from './CategoryPillBar'
import CatalogLayout from './CatalogLayout'
import ViewSwitcherButton from './ViewSwitcherButton'
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

  // Fully unfiltered view ("Toate", no category/brand/subcategory/search) —
  // computed up front so we can pick the right fetch below.
  const isTrulyUnfiltered = !isFiltered && !sp.subcategorie

  // "Toate" gets the merchandising-priority fetch (aspiratoare → scule
  // electrice → restul Curatenie → rest); everything else keeps the plain
  // filtered/DB-ordered fetch. getHomeProducts is new and does a fair bit of
  // its own query composition (multiple tiers, offset math across them) —
  // if it ever throws for a reason not caught in testing, falling back to
  // the plain unfiltered getProducts() means /produse degrades to "no
  // priority ordering" instead of a hard 500 for every visitor.
  const fetchListing = async () => {
    if (!isTrulyUnfiltered) {
      return getProducts({
        page: 1,
        pageSize,
        brandName: sp.brand,
        categoryText: sp.categorie,
        subcategoryText: sp.subcategorie,
        search: sp.q,
      })
    }
    try {
      return await getHomeProducts({ page: 1, pageSize })
    } catch (err) {
      console.error('[produse] getHomeProducts failed, falling back to plain listing:', err)
      return getProducts({ page: 1, pageSize })
    }
  }

  // Fetch in parallel — all-subs only needed for unfiltered view; brand-subs when brand filter active;
  // categorySubs when a category is active (shared by SubcategoryBar and the pills-mode dropdowns
  // below, so the two views never disagree on the list).
  const [{ products: rawProducts, total }, categoriesResult, brands, allSubs, brandSubs, categorySubs, rawTotal] = await Promise.all([
    fetchListing(),
    getCategoriesWithCount(),
    getBrandsByFilter({
      categoryText: sp.categorie,
      subcategoryText: sp.subcategorie,
      search: sp.q,
    }),
    !isFiltered ? getAllSubcategoriesWithCount() : Promise.resolve([]),
    sp.brand && !sp.categorie ? getSubcategoriesByBrandName(sp.brand) : Promise.resolve([]),
    sp.categorie ? getSubcategoriesByCategoryName(sp.categorie) : Promise.resolve([]),
    getRawProductCount(),
  ])

  // Hide the catch-all "Necategorizat" bucket from the sidebar category list
  const categories = categoriesResult.filter(c => c.name.toLowerCase() !== 'necategorizat')

  // Same subcategory set the visible SubcategoryBar/pill row would show —
  // used to populate the "pills mode" Subcategorie dropdown.
  const subcategoryOptions = sp.categorie
    ? categorySubs
    : (sp.brand && !sp.categorie && brandSubs.length > 0)
    ? brandSubs
    : allSubs

  // Only one bar is ever sticky right under the navbar at a time: the
  // dropdown row (CatalogLayout) while nothing's selected, or the
  // subcategory pill bar (SubcategoryBar) once a category/brand is active.
  const categoryOrBrandActive = !!(sp.categorie || sp.brand)

  // Shuffle only applies to brand-only/category-only filtered views now —
  // "Toate" already comes back in a fixed tier order from getHomeProducts
  // (shuffling would undermine the whole point of prioritizing aspiratoare
  // first), and subcategory/search views keep stable DB order as before.
  const products = isTrulyUnfiltered
    ? rawProducts
    : (sp.subcategorie || sp.q) ? rawProducts : shuffle(rawProducts)

  const activeCategory = sp.categorie
    ? categories.find(c => c.name.toLowerCase() === sp.categorie!.toLowerCase())
    : null

  // Show the site-wide raw total (same number as /admin/status and the
  // homepage) instead of the family-deduped, image-filtered listing count.
  // Any actual filter still shows its own accurately-scoped count.
  const heroTotal = isTrulyUnfiltered ? rawTotal : total

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
        /* Same max-width + 12px side padding as the nav's own container (see
           Nav.tsx .nav-inner) — sidebar/grid edges now line up exactly with
           the logo/contact button above. The gap between sidebar and grid
           comes from the flex gap below, not from asymmetric padding on each child
           (that's what was pushing the sidebar/grid inward past the 12px
           mark and making this container read as narrower than the nav). */
        .catalog-layout {
          display: flex; max-width: 1440px; margin: 0 auto; padding: 0 12px; gap: 32px;
        }
        .sidebar {
          width: 280px; flex-shrink: 0;
          padding: 32px 0 40px;
          /* Sticky, but NOT height-capped — a fixed height + overflow-y:auto
             with a hidden scrollbar (see Sidebar.tsx) made a long
             Categorii+Branduri list look clipped at the viewport edge with no
             visible way to reach the rest. Letting it grow naturally means
             it sticks to the top while it fits, then releases and scrolls
             with the page once the list is taller than the viewport — every
             brand stays reachable via normal page scroll. */
          position: sticky; top: 52px;
        }
        .products-main { flex: 1; padding: 32px 0 80px; min-width: 0; }
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

          /* Sidebar becomes a fixed-position overlay drawer below, so
             products-main is the only in-flow child here on mobile — its
             own 12px side padding (below) is the single source of truth.
             Keeping this rule's desktop "padding: 0 12px" too would stack
             both, doubling the edge padding to 24px vs. the nav's 12px. */
          .catalog-layout { flex-direction: column; padding: 0; }
          .sidebar {
            position: fixed; top: 0; left: 0; bottom: 0;
            width: 280px; z-index: 200;
            transform: translateX(-100%);
            transition: transform 300ms ease;
            height: 100vh;
            /* Overlay drawer, not part of the flex layout above — needs its
               own explicit horizontal padding (desktop's is 0, meant to line
               up with the flex gap on .catalog-layout instead). */
            padding: 72px 16px 40px 24px;
            background: rgb(244,244,244);
            box-shadow: 4px 0 24px rgba(0,0,0,0.12);
            /* Unlike desktop, this is a fixed full-height overlay drawer, not
               part of normal page flow — it needs its own internal scroll to
               reach everything. */
            overflow-y: auto;
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
          /* Lives as the first flex item inside .subcat-bar's horizontal
             scroll row (see SubcategoryBar.tsx) — sticky to the left edge
             of that scroll container so it stays put while the pills swipe
             past behind it, and stays clear of the page's own vertical
             sticky-under-nav positioning (a separate concern). */
          .sidebar-toggle {
            display: flex; align-items: center; justify-content: center;
            flex-shrink: 0;
            width: 44px; height: 44px;
            border-radius: 10px;
            background: rgb(217,44,43);
            border: none;
            padding: 0;
            color: rgb(255,255,255);
            cursor: pointer;
            position: sticky;
            left: 0;
            z-index: 2;
          }
          .products-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
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
              <span className="cat-hero-stat-num">{heroTotal.toLocaleString('ro')}</span>
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
        <CatalogLayout
          sidebar={
            <>
              <MobileFilterBackdrop />
              <Sidebar
                categories={categories}
                brands={brands}
                activeCat={sp.categorie}
                activeSub={sp.subcategorie}
                activeBrand={sp.brand}
                totalCount={rawTotal}
              />
            </>
          }
          dropdowns={
            <CatalogDropdowns
              categories={categories}
              brands={brands}
              subcategories={subcategoryOptions}
              activeCat={sp.categorie}
              activeBrand={sp.brand}
              activeSub={sp.subcategorie}
            />
          }
          filterRowSticky={!categoryOrBrandActive}
        >
          {/* Subcategory bar — category, brand, or all-products view. The
              desktop view-switcher + mobile filter toggle render INSIDE the
              bar (as its first, left-pinned items) so they and the pills
              read as one scrollable row; when there's no bar to show
              (search results, filters with no subcategories) it falls back
              to its own standalone row so both stay reachable. Only sticky
              right under the navbar once a category/brand is active — see
              filterRowSticky above for the dropdown row's complementary
              sticky state. */}
          {sp.categorie ? (
            <SubcategoryBar
              toggle={<><ViewSwitcherButton /><MobileFilterToggle /></>}
              categoryName={sp.categorie}
              brandName={sp.brand}
              activeSub={sp.subcategorie}
              total={activeCategory?.product_count}
              prefetchedSubs={categorySubs}
            />
          ) : sp.brand && brandSubs.length > 0 ? (
            <SubcategoryBar
              toggle={<><ViewSwitcherButton /><MobileFilterToggle /></>}
              brandName={sp.brand}
              activeSub={sp.subcategorie}
              total={total}
              prefetchedSubs={brandSubs}
            />
          ) : !isFiltered ? (
            <SubcategoryBar
              toggle={<><ViewSwitcherButton /><MobileFilterToggle /></>}
              activeSub={sp.subcategorie}
              total={heroTotal}
              prefetchedSubs={allSubs}
              sticky={false}
            />
          ) : (
            <div className="products-header">
              <ViewSwitcherButton />
              <MobileFilterToggle />
            </div>
          )}

          <div className="products-grid">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>

          {total > pageSize && (
            <LoadMore
              // Forces a full remount whenever the filter combo changes.
              // Without this, clicking from one subcategory pill to
              // another keeps the SAME LoadMore instance alive (Next.js
              // just re-renders it with new props at the same spot in the
              // tree), so its accumulated `products` state from the old
              // subcategory's "load more" clicks stayed in memory and got
              // rendered underneath the new subcategory's first page.
              // Built inline (not imported from LoadMore.tsx's exported
              // makeStoreKey) — that file has 'use client' at the top, and
              // calling one of its functions directly from this Server
              // Component during render is what caused the "server error"
              // on every /produse visit: Next.js turns every export of a
              // 'use client' module into a client reference, and a Server
              // Component can't invoke that reference as a plain function.
              key={`${sp.brand ?? ''}|${sp.categorie ?? ''}|${sp.subcategorie ?? ''}|${sp.q ?? ''}`}
              initialCount={products.length}
              total={total}
              filters={{ brand: sp.brand, categorie: sp.categorie, subcategorie: sp.subcategorie, q: sp.q }}
            />
          )}
        </CatalogLayout>
      </div>
      <Footer />
    </>
  )
}
