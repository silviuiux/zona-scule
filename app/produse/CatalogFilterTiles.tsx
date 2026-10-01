/* eslint-disable @next/next/no-img-element -- category photos come from hosts outside next/image's list */
import { TransitionLink as Link } from '@/components/NavigationProgress'
import { subList, type CategoryWithCount, type BrandWithCount, type SubcategoryWithCount } from '@/lib/supabase'
import BrandRail from './BrandRail'
import ColumnRail from './ColumnRail'

/**
 * Tiles-mode filters for /produse (desktop): the catalog as a shop floor.
 * A carousel of brand pills first, then one photo tile per category (count on it);
 * picking a category shows its subcategories in a panel right under the
 * tiles — collapsed to one line with the count until opened, A→Z, several
 * can be ticked (?subcategorie=A|B) — and the tiles shrink to a strip.
 * Categories are single-pick here (a store aisle at a time); brands toggle
 * like in the pill rows. Same URL as the other modes:
 * ?brand=A,B&categorie=X&subcategorie=Y.
 */
export default function CatalogFilterTiles({
  categories,
  brands,
  activeCats,
  activeBrands,
  activeSub,
  subs,
  search,
}: {
  categories: CategoryWithCount[]
  brands: BrandWithCount[]
  activeCats: string[]
  activeBrands: string[]
  activeSub?: string
  /** Subcategories of the one selected category (with counts) */
  subs: SubcategoryWithCount[]
  search?: string
}) {
  const norm = (s: string) => s.toLowerCase().trim()
  const has = (list: string[], name: string) => list.some(v => norm(v) === norm(name))
  const href = (b: string[], c: string[], subs: string[] = []) => {
    const p = new URLSearchParams()
    if (b.length) p.set('brand', b.join(','))
    if (c.length) p.set('categorie', c.join(','))
    if (subs.length) p.set('subcategorie', subs.join('|'))
    if (search) p.set('q', search)
    const qs = p.toString().replace(/%2C/g, ',').replace(/%7C/g, '|')
    return qs ? `/produse?${qs}` : '/produse'
  }

  const cats = categories.filter(c => c.product_count > 0 || has(activeCats, c.name))
  const catOne = activeCats.length === 1 ? cats.find(c => has(activeCats, c.name)) : undefined
  const picked = activeCats.length > 0

  const brandItems = brands
    .filter(b => b.product_count > 0 || has(activeBrands, b.name))
    .map(b => {
      const on = has(activeBrands, b.name)
      const next = on ? activeBrands.filter(v => norm(v) !== norm(b.name)) : [...activeBrands, b.name]
      return { name: b.name, on, href: href(next, activeCats) }
    })
  const subSel = subList(activeSub)
  const isSub = (name: string) => subSel.some(v => norm(v) === norm(name))
  const shownSubs = subs
    .filter(s => s.product_count > 0 || isSub(s.name))
    .sort((a, b) => a.name.localeCompare(b.name, 'ro'))
  // "Toate" first, then the subcategories A→Z, cut into columns of 12 rows
  // that sit side by side in a carousel
  type Row = { all: true } | { all: false; s: SubcategoryWithCount; on: boolean; next: string[] }
  const rows: Row[] = [
    { all: true },
    ...shownSubs.map(s => {
      const on = isSub(s.name)
      return { all: false as const, s, on, next: on ? subSel.filter(v => norm(v) !== norm(s.name)) : [...subSel, s.name] }
    }),
  ]
  const ROWS_PER_COLUMN = 12
  const columns: Row[][] = []
  for (let i = 0; i < rows.length; i += ROWS_PER_COLUMN) columns.push(rows.slice(i, i + ROWS_PER_COLUMN))

  return (
    <div className={`ft${picked ? ' picked' : ''}`}>
      <style>{`
        .ft { margin: 24px 0 40px; }
        .ft-tiles { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 12px; }
        .ft-tile {
          position: relative; display: flex; flex-direction: column; justify-content: flex-end;
          height: 188px; border-radius: 4px; overflow: hidden; text-decoration: none;
          background: rgb(30,30,30); color: rgb(255,255,255);
          outline: 2px solid transparent; outline-offset: 3px;
          transition: height 450ms cubic-bezier(0.2, 0.7, 0.1, 1), opacity 200ms, outline-color 150ms;
        }
        .ft-tile img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform 700ms cubic-bezier(0.2, 0.7, 0.1, 1); }
        .ft-tile::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.72) 100%); }
        .ft-tile:hover img { transform: scale(1.05); }
        .ft-tile-body { position: relative; z-index: 1; padding: 14px 16px; display: flex; flex-direction: column; gap: 4px; }
        .ft-tile-name { font-family: 'Recursive', sans-serif; font-size: 14px; line-height: 1.25; }
        .ft-tile-count { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; color: rgba(255,255,255,0.65); }
        .ft-tile.on { outline-color: rgb(0,0,0); }
        /* one category open: the tiles become a strip, the others step back */
        .ft.picked .ft-tile { height: 64px; }
        .ft.picked .ft-tile:not(.on) { opacity: 0.55; }
        .ft.picked .ft-tile:not(.on):hover { opacity: 1; }
        .ft.picked .ft-tile-count { display: none; }
        .ft.picked .ft-tile-body { padding: 10px 12px; }
        .ft.picked .ft-tile-name { font-size: 12.5px; }

        .ft-panel {
          position: relative;
          margin-top: 16px; padding: 0 32px;
          background: rgb(255,255,255); border: 1px solid rgba(0,0,0,0.07); border-radius: 4px;
          animation: ft-open 450ms cubic-bezier(0.2, 0.7, 0.1, 1);
        }
        @keyframes ft-open { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }
        .ft-panel-head {
          display: flex; align-items: baseline; gap: 16px; padding: 24px 0; padding-right: 120px;
          cursor: pointer; list-style: none;
        }
        .ft-panel-head::-webkit-details-marker { display: none; }
        .ft-panel-toggle {
          display: inline-flex; align-items: center; gap: 8px; margin-left: 8px;
          font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: rgb(0,0,0);
        }
        .ft-panel-toggle svg { transition: transform 200ms; }
        .ft-panel-d[open] .ft-panel-toggle svg { transform: rotate(180deg); }
        .ft-panel-toggle .when-open { display: none; }
        .ft-panel-d[open] .ft-panel-toggle .when-open { display: inline; }
        .ft-panel-d[open] .ft-panel-toggle .when-closed { display: none; }
        .ft-panel-sel { color: rgb(217,44,43); }
        .ft-panel-d[open] .cr { padding-bottom: 32px; }
        .ft-panel-title { font-family: 'Neuton', serif; font-size: 36px; line-height: 1; color: rgb(0,0,0); }
        .ft-panel-meta { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; letter-spacing: 0.1em; color: rgba(0,0,0,0.45); text-transform: uppercase; }
        .ft-panel-close { position: absolute; top: 30px; right: 32px; z-index: 1; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: rgb(0,0,0); text-decoration: none; }
        .ft-panel-close:hover { color: rgb(217,44,43); }
        .ft-subs { list-style: none; }
        .ft-sub a {
          display: flex; align-items: baseline; gap: 10px; padding: 7px 0;
          border-bottom: 1px solid rgba(0,0,0,0.06);
          font-family: 'Recursive', sans-serif; font-size: 13px; color: rgba(0,0,0,0.7); text-decoration: none;
          transition: color 150ms;
        }
        .ft-sub a:hover { color: rgb(0,0,0); }
        .ft-sub a i {
          flex: 0 0 auto; width: 12px; height: 12px; border: 1px solid rgba(0,0,0,0.3); border-radius: 2px;
          align-self: center; position: relative; transition: border-color 150ms, background 150ms;
        }
        .ft-sub a:hover i { border-color: rgba(0,0,0,0.6); }
        .ft-sub.on a i { background: rgb(217,44,43); border-color: rgb(217,44,43); }
        .ft-sub.on a i::after { content: ''; position: absolute; left: 3px; top: 0; width: 4px; height: 7px; border: solid rgb(255,255,255); border-width: 0 1.5px 1.5px 0; transform: rotate(45deg); }
        .ft-sub.all a i { display: none; }
        .ft-sub a span { margin-left: auto; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; color: rgba(0,0,0,0.35); }
        .ft-sub.on a { color: rgb(217,44,43); }
        .ft-sub.on a span { color: rgb(217,44,43); }

        @media (max-width: 1200px) { .ft-tiles { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
      `}</style>

      <BrandRail
        items={brandItems}
        allHref={href([], activeCats)}
        noneOn={activeBrands.length === 0}
      />

      <div className="ft-tiles">
        {cats.map(c => {
          const on = has(activeCats, c.name)
          return (
            <Link key={c.id} href={href(activeBrands, on ? [] : [c.name])} className={`ft-tile${on ? ' on' : ''}`} aria-pressed={on}>
              {c.hero_image_url && <img src={c.hero_image_url} alt="" loading="lazy" />}
              <span className="ft-tile-body">
                <span className="ft-tile-name">{c.name}</span>
                <span className="ft-tile-count">{c.product_count.toLocaleString('ro')} produse</span>
              </span>
            </Link>
          )
        })}
      </div>

      {catOne && shownSubs.length > 0 && (
        <div className="ft-panel">
        <Link href={href(activeBrands, [])} className="ft-panel-close">× Închide</Link>
        <details className="ft-panel-d" open={subSel.length > 0}>
          <summary className="ft-panel-head">
            <span className="ft-panel-title">{catOne.name}</span>
            <span className="ft-panel-meta">
              {shownSubs.length} subcategorii
              {subSel.length > 0 && <span className="ft-panel-sel"> · {subSel.length} {subSel.length === 1 ? 'aleasă' : 'alese'}</span>}
            </span>
            <span className="ft-panel-toggle">
              <span className="when-closed">Arată</span><span className="when-open">Ascunde</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
            </span>
          </summary>
          <ColumnRail label="Subcategorii">
            {columns.map((col, ci) => (
              <ul key={ci} className="ft-subs">
                {col.map(item => item.all ? (
                  <li key="__all" className={`ft-sub all${subSel.length === 0 ? ' on' : ''}`}>
                    <Link href={href(activeBrands, [catOne.name])}>Toate<span>{catOne.product_count.toLocaleString('ro')}</span></Link>
                  </li>
                ) : (
                  <li key={item.s.id} className={`ft-sub${item.on ? ' on' : ''}`}>
                    <Link href={href(activeBrands, [catOne.name], item.next)} aria-pressed={item.on} scroll={false}><i aria-hidden="true" />{item.s.name}<span>{item.s.product_count.toLocaleString('ro')}</span></Link>
                  </li>
                ))}
              </ul>
            ))}
          </ColumnRail>
        </details>
        </div>
      )}
    </div>
  )
}
