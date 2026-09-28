import { TransitionLink as Link } from '@/components/NavigationProgress'
import type { CategoryWithCount, BrandWithCount } from '@/lib/supabase'
import SubcategoryPillScroller from './SubcategoryPillScroller'

/**
 * Pills-mode filters for /produse (desktop): a brands row, then a
 * categories row — both multi-select and intersecting. Picking pills within
 * a row widens the selection (OR); the two rows narrow each other (AND), and
 * each row's counts are scoped to what's selected in the other one. The
 * first pill of each row ("Toate") clears that row. Changing the selection
 * drops the subcategory (it belonged to the previous category) and keeps a
 * search. Scrolling (wheel + arrow buttons) comes from
 * SubcategoryPillScroller.
 *
 * URL: ?brand=A,B&categorie=X,Y (brand and category names never contain
 * commas).
 */
export default function CatalogFilterPills({
  categories,
  brands,
  activeCats,
  activeBrands,
  search,
}: {
  categories: CategoryWithCount[]
  brands: BrandWithCount[]
  activeCats: string[]
  activeBrands: string[]
  search?: string
}) {
  const norm = (s: string) => s.toLowerCase().trim()
  const has = (list: string[], name: string) => list.some(v => norm(v) === norm(name))
  const toggle = (list: string[], name: string) =>
    has(list, name) ? list.filter(v => norm(v) !== norm(name)) : [...list, name]
  const href = (b: string[], c: string[]) => {
    const p = new URLSearchParams()
    if (b.length) p.set('brand', b.join(','))
    if (c.length) p.set('categorie', c.join(','))
    if (search) p.set('q', search)
    const qs = p.toString().replace(/%2C/g, ',')
    return qs ? `/produse?${qs}` : '/produse'
  }
  // Hide pills with nothing left in the other row's selection — unless
  // they're selected, so they can still be switched off.
  const shownBrands = brands.filter(b => b.product_count > 0 || has(activeBrands, b.name))
  const shownCats = categories.filter(c => c.product_count > 0 || has(activeCats, c.name))

  return (
    <>
      <style>{`
        .fp-track {
          display: flex; gap: 8px;
          overflow-x: auto;
          scrollbar-width: none; -ms-overflow-style: none;
        }
        .fp-track::-webkit-scrollbar { display: none; }
        .fp-pill {
          display: inline-flex; align-items: center; gap: 10px;
          height: 44px; padding: 0 18px; flex-shrink: 0;
          border-radius: 4px; /* same corners as the breadcrumb and buttons */
          font-family: 'Recursive', sans-serif;
          font-size: 13px; color: rgba(0,0,0,0.7);
          text-decoration: none; white-space: nowrap;
          background: rgb(255,255,255);
          border: 1px solid rgba(0,0,0,0.07);
          transition: border-color 150ms, color 150ms, background 150ms;
        }
        .fp-pill:hover { border-color: rgba(0,0,0,0.22); color: rgb(0,0,0); }
        .fp-pill.active { background: rgb(0,0,0); border-color: rgb(0,0,0); color: rgb(255,255,255); }
        .fp-count {
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 11px; color: rgba(0,0,0,0.38);
        }
        .fp-pill.active .fp-count { color: rgba(255,255,255,0.55); }
        /* selected pills carry a small × — click again to remove */
        .fp-x { font-size: 14px; line-height: 1; color: rgba(255,255,255,0.6); margin-right: -4px; }
      `}</style>

      {shownBrands.length > 0 && (
        <SubcategoryPillScroller className="fp-track">
          <Link href={href([], activeCats)} className={`fp-pill${activeBrands.length === 0 ? ' active' : ''}`}>
            Toate brandurile
          </Link>
          {shownBrands.map(b => {
            const on = has(activeBrands, b.name)
            return (
              <Link key={b.id} href={href(toggle(activeBrands, b.name), activeCats)} className={`fp-pill${on ? ' active' : ''}`} aria-pressed={on}>
                {b.name}<span className="fp-count">{b.product_count.toLocaleString('ro')}</span>
                {on && <span className="fp-x" aria-hidden="true">×</span>}
              </Link>
            )
          })}
        </SubcategoryPillScroller>
      )}

      <SubcategoryPillScroller className="fp-track">
        <Link href={href(activeBrands, [])} className={`fp-pill${activeCats.length === 0 ? ' active' : ''}`}>
          Toate categoriile
        </Link>
        {shownCats.map(c => {
          const on = has(activeCats, c.name)
          return (
            <Link key={c.id} href={href(activeBrands, toggle(activeCats, c.name))} className={`fp-pill${on ? ' active' : ''}`} aria-pressed={on}>
              {c.name}<span className="fp-count">{c.product_count.toLocaleString('ro')}</span>
              {on && <span className="fp-x" aria-hidden="true">×</span>}
            </Link>
          )
        })}
      </SubcategoryPillScroller>
    </>
  )
}
