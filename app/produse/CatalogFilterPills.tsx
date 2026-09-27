import { TransitionLink as Link } from '@/components/NavigationProgress'
import type { CategoryWithCount, BrandWithCount } from '@/lib/supabase'
import SubcategoryPillScroller from './SubcategoryPillScroller'

/**
 * Pills-mode filters for /produse (desktop): two separate horizontal pill
 * carousels — Categorii and Branduri — each led by a mono label. Replaces
 * the old brand/category/subcategory dropdown row; subcategories keep
 * their own pill bar below (SubcategoryBar.tsx). Scrolling (wheel + arrow
 * buttons) comes from SubcategoryPillScroller.
 *
 * Hrefs mirror Sidebar.tsx: picking a category drops brand/subcategory;
 * picking a brand keeps the category and drops the subcategory. The first
 * pill of each row clears that filter.
 */
export default function CatalogFilterPills({
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
  const enc = encodeURIComponent
  const catHref = (name: string) => `/produse?categorie=${enc(name)}`
  const brandAllHref = activeCat ? catHref(activeCat) : '/produse'
  const brandHref = (name: string) =>
    activeCat ? `/produse?categorie=${enc(activeCat)}&brand=${enc(name)}` : `/produse?brand=${enc(name)}`
  const isActive = (a: string | undefined, b: string) => !!a && a.toLowerCase() === b.toLowerCase()

  return (
    <>
      <style>{`
        .fp-row { display: flex; align-items: center; gap: 16px; }
        .fp-label {
          flex: 0 0 96px;
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 11px; font-weight: 500;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: rgba(0,0,0,0.45);
        }
        .fp-scroll { flex: 1; min-width: 0; }
        .fp-track {
          display: flex; gap: 8px;
          overflow-x: auto;
          scrollbar-width: none; -ms-overflow-style: none;
        }
        .fp-track::-webkit-scrollbar { display: none; }
        .fp-pill {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 8px 16px; flex-shrink: 0;
          border-radius: 999px;
          font-family: 'Recursive', sans-serif;
          font-size: 13px; color: rgba(0,0,0,0.7);
          text-decoration: none; white-space: nowrap;
          background: rgb(255,255,255);
          border: 1px solid rgba(0,0,0,0.08);
          transition: border-color 150ms, color 150ms, background 150ms;
        }
        .fp-pill:hover { border-color: rgba(0,0,0,0.25); color: rgb(0,0,0); }
        .fp-pill.active { background: rgb(0,0,0); border-color: rgb(0,0,0); color: rgb(255,255,255); }
        .fp-count {
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 11px; color: rgba(0,0,0,0.4);
        }
        .fp-pill.active .fp-count { color: rgba(255,255,255,0.55); }
      `}</style>

      <div className="fp-row">
        <span className="fp-label">Categorii</span>
        <div className="fp-scroll">
          <SubcategoryPillScroller className="fp-track">
            <Link href="/produse" className={`fp-pill${!activeCat ? ' active' : ''}`}>
              Toate<span className="fp-count">{totalCount.toLocaleString('ro')}</span>
            </Link>
            {categories.map(c => (
              <Link key={c.id} href={catHref(c.name)} className={`fp-pill${isActive(activeCat, c.name) ? ' active' : ''}`}>
                {c.name}<span className="fp-count">{c.product_count.toLocaleString('ro')}</span>
              </Link>
            ))}
          </SubcategoryPillScroller>
        </div>
      </div>

      {brands.length > 0 && (
        <div className="fp-row">
          <span className="fp-label">Branduri</span>
          <div className="fp-scroll">
            <SubcategoryPillScroller className="fp-track">
              <Link href={brandAllHref} className={`fp-pill${!activeBrand ? ' active' : ''}`}>
                Toate
              </Link>
              {brands.map(b => (
                <Link key={b.id} href={brandHref(b.name)} className={`fp-pill${isActive(activeBrand, b.name) ? ' active' : ''}`}>
                  {b.name}<span className="fp-count">{b.product_count.toLocaleString('ro')}</span>
                </Link>
              ))}
            </SubcategoryPillScroller>
          </div>
        </div>
      )}
    </>
  )
}
