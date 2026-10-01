import { TransitionLink as Link } from '@/components/NavigationProgress'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'
import { getProducts, getCategoriesWithCount, getBrandsByFilter, getAllSubcategoriesWithCount, getSubcategoriesByBrandName, getSubcategoriesByCategoryName, getRawProductCount, getCategoriesByBrands, getSubcategoryCountsByFilters, filterList, subList } from '@/lib/supabase'
import LoadMore from './LoadMore'
import SubcategoryBar from './SubcategoryBar'
import Sidebar from './Sidebar'
import CatalogFilterPills from './CatalogFilterPills'
import CatalogFilterTiles from './CatalogFilterTiles'
import CatalogLayout from './CatalogLayout'
import { ViewModeProvider } from './ViewModeContext'
import ViewSwitcherButton from './ViewSwitcherButton'
import { MobileFilterToggle, MobileFilterBackdrop } from './MobileFilterDrawer'
import { getBrandHref } from '@/lib/brand-content'

export const dynamic = 'force-dynamic'

type SP = { brand?: string; categorie?: string; subcategorie?: string; q?: string }

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams
  // Initial server-rendered batch. Kept small (was 100) so /produse ships a
  // light first payload — the rest streams in via LoadMore. MUST match the
  // pageSize LoadMore requests, or offset pagination skips/dupes products.
  const pageSize = 24
  const isFiltered = !!(sp.brand || sp.categorie || sp.q)
  // Brands / categories can be multi-selected (?brand=A,B&categorie=X,Y).
  // Views that only make sense for ONE of them (category hero, subcategory
  // bar, breadcrumb) use catOne / brandOne.
  const brandSel = filterList(sp.brand)
  const catSel = filterList(sp.categorie)
  const brandOne = brandSel.length === 1 ? brandSel[0] : undefined
  const catOne = catSel.length === 1 ? catSel[0] : undefined
  const multi = brandSel.length > 1 || catSel.length > 1
  // One brand picked, and it has its own landing page → link to it
  const brandPageHref = brandSel.length === 1 && getBrandHref(brandSel[0]).startsWith('/brand/') ? getBrandHref(brandSel[0]) : undefined

  // Fully unfiltered view ("Toate", no category/brand/subcategory/search) —
  // still needed for the fetch-shape decisions below (which sidebar data to
  // load), even though every view now goes through the same getProducts()
  // call with the same global price-descending order (2026-07-11 — see
  // "sorting order rules july 11.md" for the merchandising-tier/shuffle
  // logic this replaced).
  const isTrulyUnfiltered = !isFiltered && !sp.subcategorie

  // Fetch in parallel. allSubs feeds the unfiltered ("Toate") subcategory
  // pill bar.
  const [{ products, total }, categoriesResult, brands, allSubs, brandSubs, categorySubs, rawTotal] = await Promise.all([
    getProducts({
      page: 1,
      pageSize,
      brandName: brandSel,
      categoryText: catSel,
      subcategoryText: sp.subcategorie,
      search: sp.q,
    }),
    getCategoriesWithCount(),
    getBrandsByFilter({
      categoryText: catSel,
      subcategoryText: sp.subcategorie,
      search: sp.q,
    }),
    getAllSubcategoriesWithCount(),
    brandOne && catSel.length === 0 ? getSubcategoriesByBrandName(brandOne) : Promise.resolve([]),
    catOne ? getSubcategoriesByCategoryName(catOne) : Promise.resolve([]),
    getRawProductCount(),
  ])

  // With a brand or a search on top of the category, the panel's
  // subcategory counts follow them too — a subcategory only shows a number
  // the listing can actually deliver under the same filters.
  const scopedSubs = catOne && (brandSel.length || sp.q)
    ? await getSubcategoryCountsByFilters(categoriesResult.find(c => c.name.toLowerCase() === catOne.toLowerCase())?.name ?? catOne, brandSel, sp.q)
        .then(counts => categorySubs.map(s => ({ ...s, product_count: counts[s.name.toLowerCase().trim()] ?? 0 })))
    : categorySubs

  // Zero results: work out which single filter is in the way, by counting
  // what each one-filter-less combination would return.
  const subSel = subList(sp.subcategorie)
  const emptyHints: { label: string; href: string; count: number }[] = []
  if (total === 0) {
    const url = (b: string[], c: string[], s: string[], q?: string) => {
      const p = new URLSearchParams()
      if (b.length) p.set('brand', b.join(','))
      if (c.length) p.set('categorie', c.join(','))
      if (s.length) p.set('subcategorie', s.join('|'))
      if (q) p.set('q', q)
      const qs = p.toString().replace(/%2C/g, ',').replace(/%7C/g, '|')
      return qs ? `/produse?${qs}` : '/produse'
    }
    const count = (b: string[], c: string[], s: string[], q?: string) =>
      getProducts({ page: 1, pageSize: 1, brandName: b, categoryText: c, subcategoryText: s.join('|') || undefined, search: q })
        .then(r => r.total).catch(() => 0)
    const tries: { label: string; b: string[]; c: string[]; s: string[]; q?: string }[] = []
    if (brandSel.length) tries.push({ label: brandSel.length === 1 ? `Fără brandul ${brandSel[0]}` : 'Fără filtrul de branduri', b: [], c: catSel, s: subSel, q: sp.q })
    if (subSel.length) tries.push({ label: subSel.length === 1 ? `Fără subcategoria ${subSel[0]}` : 'Fără subcategoriile alese', b: brandSel, c: catSel, s: [], q: sp.q })
    if (catSel.length) tries.push({ label: catSel.length === 1 ? `Fără categoria ${catSel[0]}` : 'Fără filtrul de categorii', b: brandSel, c: [], s: [], q: sp.q })
    if (sp.q) tries.push({ label: `Fără căutarea „${sp.q}”`, b: brandSel, c: catSel, s: subSel })
    const counts = await Promise.all(tries.map(t => count(t.b, t.c, t.s, t.q)))
    tries.forEach((t, i) => emptyHints.push({ label: t.label, href: url(t.b, t.c, t.s, t.q), count: counts[i] }))
  }

  // Hide the catch-all "Necategorizat" bucket from the sidebar category list
  const categories = categoriesResult.filter(c => c.name.toLowerCase() !== 'necategorizat')
  // counts in the categories pill row, scoped to the selected brands
  const pillCategories = brandSel.length ? await getCategoriesByBrands(brandSel, categories) : categories

  const activeCategory = catOne
    ? categories.find(c => c.name.toLowerCase() === catOne.toLowerCase())
    : null

  // Show the site-wide raw total (same number as /admin/status and the
  // homepage) instead of the family-deduped, image-filtered listing count.
  // Any actual filter still shows its own accurately-scoped count.
  const heroTotal = isTrulyUnfiltered ? rawTotal : total

  return (
    <>
      <Nav />
      <ViewModeProvider>
      <style>{`
        /* ── Hero section (white) ── */
        .cat-hero {
          background: rgb(255, 255, 255);
          padding-top: var(--nav-h); /* nav height */
          border-bottom: 1px solid rgba(0,0,0,0.07);
        }
        .cat-hero-inner {
          max-width: 1440px;
          margin: 0 auto;
          padding: var(--hero-top) var(--gutter) 56px; /* same start as every page hero */
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
          display: inline-flex; align-items: center; height: 28px;
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(0,0,0,0.45);
          text-decoration: none;
          border: 1px solid rgba(0,0,0,0.18);
          border-radius: 4px;
          padding: 0 14px;
          transition: color 150ms, border-color 150ms;
          white-space: nowrap;
        }
        .cat-bc-pill:hover { color: rgb(0,0,0); border-color: rgba(0,0,0,0.4); }
        .cat-bc-sep {
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 11px;
          color: rgba(0,0,0,0.25);
        }
        .cat-bc-current {
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(0,0,0,0.45);
          white-space: nowrap;
        }

        /* Title */
        .cat-hero-title {
          display: flex;
          flex-direction: column;
          gap: 0;
          margin-bottom: 28px;
          line-height: 1;
        }
        .cat-hero-zona,
        .cat-hero-name {
          font-family: 'Neuton', serif; font-weight: 400;
          /* the same title as every page hero (.zs-title) */
          font-size: clamp(56px, 8vw, 128px);
          letter-spacing: -0.015em;
          line-height: 0.92;
        }
        .cat-hero-zona { color: rgb(217, 44, 43); }
        .cat-hero-name { color: rgb(0, 0, 0); }

        /* Description */
        /* the shared page subtitle (see .zs-sub) */
        .cat-hero-desc {
          font-family: 'Recursive', sans-serif;
          font-size: 16px; font-weight: 400;
          color: rgb(0,0,0);
          line-height: 1.6;
          max-width: 620px;
          margin: 0 0 28px;
        }

        /* Stats */
        .cat-hero-stats {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 24px;
        }
        .cat-hero-stat {
          display: flex;
          align-items: baseline;
          gap: 8px;
        }
        .cat-hero-stat-num {
          font-family: 'JetBrains Mono', ui-monospace, monospace; font-weight: 500;
          font-size: 22px;
          color: rgb(0,0,0);
          letter-spacing: -0.02em;
          font-variant-numeric: tabular-nums;
        }
        .cat-hero-stat-label {
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 10.5px;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(0,0,0,0.35);
        }
        /* Secondary, outlined: one brand picked and it has its own page */
        .cat-hero-brand-link {
          margin-left: auto;
          display: inline-flex; align-items: center; gap: 16px;
          height: 44px; padding: 0 24px; border-radius: 4px;
          border: 1px solid rgba(0,0,0,0.85); color: rgb(0,0,0);
          font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 500;
          letter-spacing: 0.04em; text-transform: uppercase; text-decoration: none; white-space: nowrap;
          transition: background 150ms, color 150ms;
        }
        .cat-hero-brand-link:hover { background: rgb(0,0,0); color: rgb(255,255,255); }
        .cat-hero-brand-link span { transition: transform 150ms; }
        .cat-hero-brand-link:hover span { transform: translateX(3px); }
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
          display: flex; max-width: 1440px; margin: 0 auto; padding: 0 var(--gutter); gap: 32px;
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
          position: sticky; top: var(--nav-h);
        }
        .products-main { flex: 1; padding: 32px 0 80px; min-width: 0; }
        .products-header {
          margin-bottom: 24px;
          display: flex; align-items: center; gap: 16px;
        }
        .empty-state {
          padding: 40px; margin-bottom: 40px;
          background: rgb(255,255,255); border: 1px solid rgba(0,0,0,0.07); border-radius: 4px;
          max-width: 760px;
        }
        .empty-kicker { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: rgb(217,44,43); }
        .empty-title { font-family: 'Neuton', serif; font-weight: 400; font-size: 32px; line-height: 1.1; color: rgb(0,0,0); margin: 12px 0 16px; }
        .empty-text { font-family: 'Recursive', sans-serif; font-size: 14px; line-height: 1.6; color: rgba(0,0,0,0.7); margin-bottom: 20px; }
        .empty-text b { color: rgb(0,0,0); font-weight: 600; }
        .empty-hints { list-style: none; margin-bottom: 24px; border-top: 1px solid rgba(0,0,0,0.08); }
        .empty-hints a {
          display: flex; align-items: baseline; gap: 12px; padding: 12px 0;
          border-bottom: 1px solid rgba(0,0,0,0.08); text-decoration: none;
          font-family: 'Recursive', sans-serif; font-size: 14px; color: rgb(0,0,0);
          transition: color 150ms;
        }
        .empty-hints a:hover { color: rgb(217,44,43); }
        .empty-hints a span { margin-left: auto; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; color: rgba(0,0,0,0.45); white-space: nowrap; }
        .empty-reset { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: rgb(0,0,0); text-decoration: underline; text-underline-offset: 3px; }
        .empty-reset:hover { color: rgb(217,44,43); }
        @media (max-width: 767px) { .empty-state { padding: 24px; } .empty-title { font-size: 26px; } }
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
          .cat-hero-inner { padding: var(--hero-top) var(--gutter) 40px; }

          .cat-hero-brand-link { margin-left: 0; }

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
          .products-main { padding: 20px var(--gutter) 60px; }
        }
      `}</style>

      {/* ── White hero section ── */}
      <div className="cat-hero">
        <div className="cat-hero-inner">
          {/* Breadcrumb */}
          <nav className="cat-breadcrumb">
            <ViewSwitcherButton />
            <Link href="/produse" className="cat-bc-pill">Catalog</Link>
            {multi ? (
              <>
                <span className="cat-bc-sep">/</span>
                <span className="cat-bc-current">Selecție</span>
              </>
            ) : catOne && (
              <>
                <span className="cat-bc-sep">/</span>
                {sp.subcategorie ? (
                  <Link
                    href={`/produse?categorie=${encodeURIComponent(catOne)}`}
                    className="cat-bc-pill"
                  >
                    {catOne}
                  </Link>
                ) : (
                  <span className="cat-bc-current">{catOne}</span>
                )}
              </>
            )}
            {sp.subcategorie && (
              <>
                <span className="cat-bc-sep">/</span>
                <span className="cat-bc-current">{subList(sp.subcategorie).join(' · ')}</span>
              </>
            )}
            {!multi && brandOne && !catOne && (
              <>
                <span className="cat-bc-sep">/</span>
                <span className="cat-bc-current">{brandOne}</span>
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
            {multi ? (
              <>
                <span className="cat-hero-zona">Selecție</span>
                <span className="cat-hero-name" style={{ fontSize: 'clamp(28px, 4vw, 56px)' }}>
                  {[...brandSel, ...catSel].join(' · ')}
                </span>
              </>
            ) : catOne ? (
              <>
                <span className="cat-hero-zona">Zona</span>
                <span className="cat-hero-name">{catOne}</span>
              </>
            ) : brandOne ? (
              <>
                <span className="cat-hero-zona">Zona</span>
                <span className="cat-hero-name">{brandOne}</span>
              </>
            ) : sp.q ? (
              <>
                <span className="cat-hero-zona">Căutare</span>
                <span className="cat-hero-name" style={{ fontSize: 'clamp(28px, 4vw, 56px)' }}>
                  &ldquo;{sp.q}&rdquo;
                </span>
              </>
            ) : (
              <>
                <span className="cat-hero-zona">Zona</span>
                <span className="cat-hero-name">Scule</span>
              </>
            )}
          </div>

          {/* Description */}
          {activeCategory?.description ? (
            <p className="cat-hero-desc">{activeCategory.description}</p>
          ) : isTrulyUnfiltered && (
            <p className="cat-hero-desc">
              Scule electrice și de mână, accesorii și abrazive, aparate de măsură, echipamente de curățenie
              și de protecție — gama completă a producătorilor pe care îi distribuim, pentru profesioniști și firme.
            </p>
          )}

          {/* Stats */}
          <div className="cat-hero-stats">
            <div className="cat-hero-stat">
              <span className="cat-hero-stat-num">{heroTotal.toLocaleString('ro')}</span>
              <span className="cat-hero-stat-label">Produse</span>
            </div>
            {/* one brand picked: the count would just say "1" */}
            {brands.length > 0 && brandSel.length !== 1 && (
              <>
                <div className="cat-hero-stat-div" />
                <div className="cat-hero-stat">
                  <span className="cat-hero-stat-num">{brandSel.length || brands.length}</span>
                  <span className="cat-hero-stat-label">Branduri</span>
                </div>
              </>
            )}
            {brandPageHref && (
              <Link href={brandPageHref} className="cat-hero-brand-link">
                Pagina {brandSel[0]} <span aria-hidden="true">→</span>
              </Link>
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
                activeCat={catOne}
                activeSub={sp.subcategorie}
                activeBrand={brandOne}
                totalCount={rawTotal}
              />
            </>
          }
          filters={
            <CatalogFilterPills
              categories={pillCategories}
              brands={brands}
              activeCats={catSel}
              activeBrands={brandSel}
              search={sp.q}
            />
          }
          tiles={
            <CatalogFilterTiles
              categories={pillCategories}
              brands={brands}
              activeCats={catSel}
              activeBrands={brandSel}
              activeSub={sp.subcategorie}
              subs={scopedSubs}
              search={sp.q}
            />
          }
        >
          {/* Subcategory bar — category, brand, or all-products view. The
              mobile filter toggle renders INSIDE the bar (as its first,
              left-pinned item) so it and the pills read as one scrollable
              row; when there's no bar to show (search results, filters
              with no subcategories) it falls back to its own standalone
              row so it's still reachable. Only sticky right under the
              navbar once a category/brand is active. (The desktop
              view-switcher lives in the hero's breadcrumb row.) */}
          {catOne && brandSel.length <= 1 ? (
            <SubcategoryBar
              toggle={<MobileFilterToggle />}
              categoryName={catOne}
              brandName={brandOne}
              activeSub={sp.subcategorie}
              prefetchedSubs={categorySubs}
            />
          ) : brandOne && catSel.length === 0 && brandSubs.length > 0 ? (
            <SubcategoryBar
              toggle={<MobileFilterToggle />}
              brandName={brandOne}
              activeSub={sp.subcategorie}
              prefetchedSubs={brandSubs}
            />
          ) : !isFiltered ? (
            <SubcategoryBar
              toggle={<MobileFilterToggle />}
              activeSub={sp.subcategorie}
              prefetchedSubs={allSubs}
              sticky={false}
            />
          ) : (
            <div className="products-header">
              <MobileFilterToggle />
            </div>
          )}

          {total === 0 ? (
            <div className="empty-state" role="status">
              <span className="empty-kicker">0 rezultate</span>
              <h2 className="empty-title">Niciun produs nu îndeplinește toate filtrele deodată</h2>
              <p className="empty-text">
                Filtrele se combină: un produs apare doar dacă e, în același timp,
                {brandSel.length > 0 && <> de la <b>{brandSel.join(' sau ')}</b></>}
                {catSel.length > 0 && <>{brandSel.length > 0 ? ',' : ''} în <b>{catSel.join(' sau ')}</b></>}
                {subSel.length > 0 && <>{(brandSel.length || catSel.length) ? ',' : ''} în subcategoria <b>{subSel.join(' sau ')}</b></>}
                {sp.q && <>{(brandSel.length || catSel.length || subSel.length) ? ' și' : ''} se potrivește cu <b>„{sp.q}”</b></>}.
                {' '}Luate separat au produse, dar intersecția lor e goală.
                {!sp.q && ' În listă apar doar produsele cu fotografie.'}
              </p>
              {emptyHints.some(h => h.count > 0) ? (
                <ul className="empty-hints">
                  {emptyHints.filter(h => h.count > 0).sort((a, b) => b.count - a.count).map(h => (
                    <li key={h.href}>
                      <Link href={h.href}>{h.label}<span>{h.count.toLocaleString('ro')} {h.count === 1 ? 'produs' : 'produse'}</span></Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-text">Nici scoțând un singur filtru nu apar produse — încearcă o combinație nouă.</p>
              )}
              <Link href="/produse" className="empty-reset">Șterge toate filtrele</Link>
            </div>
          ) : (
            <div className="products-grid">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

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
      </ViewModeProvider>
      <Footer />
    </>
  )
}
