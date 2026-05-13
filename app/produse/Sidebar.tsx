import Link from 'next/link'
import type { CategoryWithCount, BrandWithCount } from '@/lib/supabase'

const SHOW_BRANDS = true

/**
 * Sidebar for the /produse listing page.
 *
 * Flat list — no accordion. Subcategories now live in the SubcategoryBar
 * above the product grid.
 *
 * Per-row visual states:
 *  - default:     gray text, no chevron, no count pill
 *  - hover:       bold black text + count pill (black bg, white text)
 *  - active:      chevron on left + bold black text (no count pill)
 *
 * The count pill is rendered always but kept hidden via CSS so there's no
 * layout shift on hover (positioned absolutely against the row).
 */
export default function Sidebar({
  categories,
  brands,
  activeCat,
  activeBrand,
}: {
  categories: CategoryWithCount[]
  brands: BrandWithCount[]
  activeCat?: string
  activeSub?: string  // kept for API compatibility; subcategories now show in pill bar
  activeBrand?: string
}) {
  const allActive = !activeCat && !activeBrand

  return (
    <>
      <style>{`
        .sidebar::-webkit-scrollbar { width: 3px; }
        .sidebar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); }

        .sidebar-block { margin-bottom: 36px; }
        .sidebar-section-title {
          font-family: 'Inter', sans-serif;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: rgba(0,0,0,0.32);
          margin-bottom: 14px;
          padding-left: 30px;
        }

        /* Row */
        .side-item {
          position: relative;
          display: flex; align-items: center; gap: 8px;
          padding: 10px 8px 10px 0;
          font-family: 'Recursive', sans-serif;
          font-size: 15px; font-weight: 400;
          color: rgba(0,0,0,0.5);
          text-decoration: none;
          transition: color 150ms, font-weight 150ms;
        }
        .side-item:hover { color: rgb(0,0,0); font-weight: 500; }
        .side-item.active { color: rgb(0,0,0); font-weight: 500; }

        /* Chevron — only visible on active */
        .side-chev {
          width: 22px; flex-shrink: 0;
          display: inline-flex; align-items: center; justify-content: center;
          color: rgb(0,0,0);
          opacity: 0;
          transition: opacity 150ms;
        }
        .side-item.active .side-chev { opacity: 1; }
        .side-chev svg { display: block; }

        .side-name {
          flex: 1;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }

        /* Count pill — black bg, white text. Positioned absolutely so layout
           doesn't shift when it appears on hover. */
        .side-count {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          flex-shrink: 0;
          font-family: 'Inter', sans-serif;
          font-size: 11px; font-weight: 500;
          padding: 4px 11px;
          border-radius: 999px;
          background: rgb(0,0,0); color: rgb(255,255,255);
          letter-spacing: 0.02em;
          opacity: 0;
          transition: opacity 150ms;
          pointer-events: none;
        }
        /* Show count on hover BUT only when not the active row */
        .side-item:not(.active):hover .side-count { opacity: 1; }
      `}</style>

      <aside className="sidebar">
        {/* ── CATEGORII ── */}
        <div className="sidebar-block">
          <Link
            href="/produse"
            className={`side-item${allActive ? ' active' : ''}`}
          >
            <span className="side-chev" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </span>
            <span className="side-name">Toate sculele</span>
          </Link>

          {categories.map(cat => {
            const isActive = activeCat === cat.name
            return (
              <Link
                key={cat.id}
                href={`/produse?categorie=${encodeURIComponent(cat.name)}`}
                className={`side-item${isActive ? ' active' : ''}`}
              >
                <span className="side-chev" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                </span>
                <span className="side-name">{cat.name}</span>
                {cat.product_count > 0 && (
                  <span className="side-count">{cat.product_count.toLocaleString('ro')}</span>
                )}
              </Link>
            )
          })}
        </div>

        {/* ── BRANDURI ── */}
        {SHOW_BRANDS && brands.length > 0 && (
          <div className="sidebar-block">
            <p className="sidebar-section-title">Branduri</p>
            {brands.map(brand => {
              const isActive = activeBrand === brand.name
              // Preserve active category in the brand link so the user stays
              // within the current category when filtering by brand.
              const brandHref = activeCat
                ? `/produse?categorie=${encodeURIComponent(activeCat)}&brand=${encodeURIComponent(brand.name)}`
                : `/produse?brand=${encodeURIComponent(brand.name)}`
              return (
                <Link
                  key={brand.id}
                  href={brandHref}
                  className={`side-item${isActive ? ' active' : ''}`}
                >
                  <span className="side-chev" aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="m9 18 6-6-6-6"/>
                    </svg>
                  </span>
                  <span className="side-name">{brand.name}</span>
                  <span className="side-count">{brand.product_count.toLocaleString('ro')}</span>
                </Link>
              )
            })}
          </div>
        )}
      </aside>
    </>
  )
}
