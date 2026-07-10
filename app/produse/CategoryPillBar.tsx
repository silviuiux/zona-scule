import { TransitionLink as Link } from '@/components/NavigationProgress'
import type { CategoryWithCount, BrandWithCount } from '@/lib/supabase'

const SHOW_BRANDS = true

/**
 * Collapsed-sidebar view for the /produse listing page (desktop only).
 *
 * Renders categories (and, secondarily, brands) as a horizontal pill
 * carousel — the same visual language as SubcategoryBar — instead of the
 * vertical Sidebar list. Toggled by CatalogLayout; only one of
 * Sidebar / CategoryPillBar is visible at a time (CSS-driven, see
 * CatalogLayout.tsx).
 */
export default function CategoryPillBar({
  categories,
  brands,
  activeCat,
  activeBrand,
  totalCount,
}: {
  categories: CategoryWithCount[]
  brands: BrandWithCount[]
  activeCat?: string
  activeBrand?: string
  totalCount: number
}) {
  const allActive = !activeCat && !activeBrand

  return (
    <>
      <style>{`
        .cat-pill-bar {
          padding: 0 0 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .cat-pill-row {
          display: flex; gap: 10px;
          overflow-x: auto;
          scrollbar-width: none; -ms-overflow-style: none;
        }
        .cat-pill-row::-webkit-scrollbar { display: none; }

        .cat-pill {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 9px 16px; flex-shrink: 0;
          border-radius: 999px;
          font-family: 'Recursive', sans-serif;
          font-size: 13px; font-weight: 400;
          color: rgba(0,0,0,0.7);
          text-decoration: none;
          background: rgb(255,255,255);
          border: 1px solid rgba(0,0,0,0.08);
          transition: background 150ms, border-color 150ms, color 150ms;
          white-space: nowrap;
        }
        .cat-pill:hover { border-color: rgba(0,0,0,0.25); color: rgb(0,0,0); }
        .cat-pill.active { background: rgb(0,0,0); border-color: rgb(0,0,0); color: rgb(255,255,255); }

        .cat-pill-count {
          font-family: 'Inter', sans-serif;
          font-size: 11px; font-weight: 500;
          color: rgba(0,0,0,0.4);
          letter-spacing: 0.02em;
        }
        .cat-pill.active .cat-pill-count { color: rgba(255,255,255,0.55); }

        .cat-pill.brand-pill { border-style: dashed; }
      `}</style>

      <div className="cat-pill-bar">
        <div className="cat-pill-row">
          <Link href="/produse" className={`cat-pill${allActive ? ' active' : ''}`}>
            Toate
            {totalCount > 0 && <span className="cat-pill-count">{totalCount.toLocaleString('ro')}</span>}
          </Link>
          {categories.map(cat => (
            <Link
              key={cat.id}
              href={`/produse?categorie=${encodeURIComponent(cat.name)}`}
              className={`cat-pill${activeCat === cat.name ? ' active' : ''}`}
            >
              {cat.name}
              {cat.product_count > 0 && (
                <span className="cat-pill-count">{cat.product_count.toLocaleString('ro')}</span>
              )}
            </Link>
          ))}
        </div>

        {SHOW_BRANDS && brands.length > 0 && (
          <div className="cat-pill-row">
            {brands.map(brand => {
              const isActive = activeBrand === brand.name
              const brandHref = isActive
                ? (activeCat ? `/produse?categorie=${encodeURIComponent(activeCat)}` : '/produse')
                : (activeCat
                    ? `/produse?categorie=${encodeURIComponent(activeCat)}&brand=${encodeURIComponent(brand.name)}`
                    : `/produse?brand=${encodeURIComponent(brand.name)}`)
              return (
                <Link
                  key={brand.id}
                  href={brandHref}
                  className={`cat-pill brand-pill${isActive ? ' active' : ''}`}
                >
                  {brand.name}
                  <span className="cat-pill-count">{brand.product_count.toLocaleString('ro')}</span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
