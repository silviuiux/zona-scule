import { TransitionLink as Link } from '@/components/NavigationProgress'
import type { ReactNode } from 'react'
import { getSubcategoriesByCategoryName, SubcategoryWithCount } from '@/lib/supabase'
import SubcategoryPillScroller from './SubcategoryPillScroller'

export default async function SubcategoryBar({
  categoryName,
  brandName,
  activeSub,
  total,
  prefetchedSubs,
  toggle,
  sticky = true,
}: {
  categoryName?: string
  brandName?: string
  activeSub?: string
  /** Total products shown in the "Toate" pill */
  total?: number
  /** Pre-fetched subs — skips internal fetch when provided */
  prefetchedSubs?: SubcategoryWithCount[]
  /** Mobile filter-drawer toggle + desktop view-switcher buttons, rendered
   *  as the sticky-left first items in the scroll row so they stay put
   *  while pills swipe past behind them. Optional so this component still
   *  works where no toggle applies. */
  toggle?: ReactNode
  /** Pin this bar right under the navbar. Only one bar should be sticky at
   *  a time — the pills-mode dropdown row (CatalogLayout.tsx) is sticky
   *  exactly when this isn't (i.e. when no category/brand is selected),
   *  and this bar takes over stickiness once one is. Defaults to true so
   *  existing callers that don't care keep the old always-sticky behavior. */
  sticky?: boolean
}) {
  const subs = prefetchedSubs ?? (categoryName ? await getSubcategoriesByCategoryName(categoryName) : [])
  if (subs.length === 0) return toggle ? <div className="products-header">{toggle}</div> : null

  const brandParam = brandName ? `&brand=${encodeURIComponent(brandName)}` : ''

  const allHref = categoryName
    ? `/produse?categorie=${encodeURIComponent(categoryName)}${brandParam}`
    : brandName
    ? `/produse?brand=${encodeURIComponent(brandName)}`
    : '/produse'

  const subHref = (subName: string) =>
    categoryName
      ? `/produse?categorie=${encodeURIComponent(categoryName)}&subcategorie=${encodeURIComponent(subName)}${brandParam}`
      : brandName
      ? `/produse?brand=${encodeURIComponent(brandName)}&subcategorie=${encodeURIComponent(subName)}`
      : `/produse?subcategorie=${encodeURIComponent(subName)}`

  return (
    <>
      <style>{`
        .subcat-bar {
          margin: 16px 0;
          padding: 0;
          display: flex; gap: 10px;
          overflow-x: auto;
          scrollbar-width: none; -ms-overflow-style: none;
        }
        .subcat-bar::-webkit-scrollbar { display: none; }
        .subcat-bar.is-sticky {
          position: sticky;
          top: 52px;
          z-index: 50;
          /* No negative top margin here — this bar is never the first child
             of .products-main (the filter-row always precedes it), so
             pulling it up to cancel main's own padding would just overlap
             whatever's rendered above it instead. Plain padding gives it
             the same "stuck" breathing room without reaching past its own
             box. */
          margin: 0 0 16px;
          padding: 16px 0;
        }

        .subcat-pill {
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
        .subcat-pill:hover {
          border-color: rgba(0,0,0,0.25);
          color: rgb(0,0,0);
        }
        .subcat-pill.active {
          background: rgb(0,0,0);
          border-color: rgb(0,0,0);
          color: rgb(255,255,255);
        }

        .subcat-count {
          font-family: 'Inter', sans-serif;
          font-size: 11px; font-weight: 500;
          color: rgba(0,0,0,0.4);
          letter-spacing: 0.02em;
        }
        .subcat-pill.active .subcat-count { color: rgba(255,255,255,0.55); }

        @media (max-width: 768px) {
          /* Mobile always keeps the pill bar pinned under the navbar,
             regardless of the desktop-only sticky/non-sticky split above —
             the .is-sticky compound selector is included here purely so
             this wins on specificity over the desktop-only .is-sticky rule
             above (not to gate the behavior on that class). */
          .subcat-bar,
          .subcat-bar.is-sticky {
            position: sticky;
            top: 52px;
            margin: -20px 0 20px;
            padding: 32px 0;
          }
        }
      `}</style>

      <SubcategoryPillScroller className={`subcat-bar${sticky ? ' is-sticky' : ''}`}>
        {toggle}
        <Link
          href={allHref}
          className={`subcat-pill${!activeSub ? ' active' : ''}`}
        >
          Toate
          {typeof total === 'number' && total > 0 && (
            <span className="subcat-count">{total.toLocaleString('ro')}</span>
          )}
        </Link>
        {subs.map(s => (
          <Link
            key={s.id}
            href={subHref(s.name)}
            className={`subcat-pill${activeSub === s.name ? ' active' : ''}`}
          >
            {s.name}
            <span className="subcat-count">{s.product_count.toLocaleString('ro')}</span>
          </Link>
        ))}
      </SubcategoryPillScroller>
    </>
  )
}
