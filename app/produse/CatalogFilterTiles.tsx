/* eslint-disable @next/next/no-img-element -- category photos come from hosts outside next/image's list */
import { TransitionLink as Link } from '@/components/NavigationProgress'
import type { CategoryWithCount, BrandWithCount, SubcategoryWithCount } from '@/lib/supabase'
import BrandMenu from './BrandMenu'

/**
 * Tiles-mode filters for /produse (desktop): the catalog as a shop floor.
 * A compact brand menu, then one photo tile per category (count on it);
 * picking a category opens its subcategories in a panel right under the
 * tiles, and the tiles shrink to a strip so the products stay close.
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
  const href = (b: string[], c: string[], sub?: string) => {
    const p = new URLSearchParams()
    if (b.length) p.set('brand', b.join(','))
    if (c.length) p.set('categorie', c.join(','))
    if (sub) p.set('subcategorie', sub)
    if (search) p.set('q', search)
    const qs = p.toString().replace(/%2C/g, ',')
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
      return { name: b.name, count: b.product_count, on, href: href(next, activeCats) }
    })
  const brandLabel = activeBrands.length === 0 ? 'Toate' : activeBrands.length === 1 ? activeBrands[0] : `${activeBrands.length} branduri`
  const shownSubs = subs.filter(s => s.product_count > 0)

  return (
    <div className={`ft${picked ? ' picked' : ''}`}>
      <style>{`
        .ft { margin: 24px 0 40px; }
        .ft-bar { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .ft-hint {
          font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10.5px; letter-spacing: 0.14em;
          text-transform: uppercase; color: rgba(0,0,0,0.4);
        }
        .ft-reset {
          margin-left: auto; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; letter-spacing: 0.12em;
          text-transform: uppercase; color: rgb(0,0,0); text-decoration: none;
        }
        .ft-reset:hover { color: rgb(217,44,43); }

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
          margin-top: 16px; padding: 28px 32px 32px;
          background: rgb(255,255,255); border: 1px solid rgba(0,0,0,0.07); border-radius: 4px;
          animation: ft-open 450ms cubic-bezier(0.2, 0.7, 0.1, 1);
        }
        @keyframes ft-open { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }
        .ft-panel-head { display: flex; align-items: baseline; gap: 16px; margin-bottom: 20px; }
        .ft-panel-title { font-family: 'Neuton', serif; font-size: 36px; line-height: 1; color: rgb(0,0,0); }
        .ft-panel-meta { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; letter-spacing: 0.1em; color: rgba(0,0,0,0.45); text-transform: uppercase; }
        .ft-panel-close { margin-left: auto; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: rgb(0,0,0); text-decoration: none; }
        .ft-panel-close:hover { color: rgb(217,44,43); }
        .ft-subs { list-style: none; columns: 4; column-gap: 32px; }
        .ft-sub { break-inside: avoid; }
        .ft-sub a {
          display: flex; align-items: baseline; gap: 10px; padding: 7px 0;
          border-bottom: 1px solid rgba(0,0,0,0.06);
          font-family: 'Recursive', sans-serif; font-size: 13px; color: rgba(0,0,0,0.7); text-decoration: none;
          transition: color 150ms;
        }
        .ft-sub a:hover { color: rgb(0,0,0); }
        .ft-sub a span { margin-left: auto; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; color: rgba(0,0,0,0.35); }
        .ft-sub.on a { color: rgb(217,44,43); }
        .ft-sub.on a span { color: rgb(217,44,43); }

        @media (max-width: 1200px) { .ft-tiles { grid-template-columns: repeat(4, minmax(0, 1fr)); } .ft-subs { columns: 3; } }
      `}</style>

      <div className="ft-bar">
        <BrandMenu items={brandItems} label={brandLabel} clearHref={activeBrands.length ? href([], activeCats) : null} />
        <span className="ft-hint">{picked ? 'Alege o subcategorie sau altă categorie' : 'Alege o categorie'}</span>
        {(picked || activeBrands.length > 0) && <Link href={href([], [])} className="ft-reset">× Resetează</Link>}
      </div>

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
          <div className="ft-panel-head">
            <span className="ft-panel-title">{catOne.name}</span>
            <span className="ft-panel-meta">{shownSubs.length} subcategorii</span>
            <Link href={href(activeBrands, [])} className="ft-panel-close">× Închide</Link>
          </div>
          <ul className="ft-subs">
            <li className={`ft-sub${!activeSub ? ' on' : ''}`}>
              <Link href={href(activeBrands, [catOne.name])}>Toate<span>{catOne.product_count.toLocaleString('ro')}</span></Link>
            </li>
            {shownSubs.map(s => {
              const on = !!activeSub && norm(activeSub) === norm(s.name)
              return (
                <li key={s.id} className={`ft-sub${on ? ' on' : ''}`}>
                  <Link href={href(activeBrands, [catOne.name], on ? undefined : s.name)}>{s.name}<span>{s.product_count.toLocaleString('ro')}</span></Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
