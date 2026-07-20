'use client'
import { useRouter } from 'next/navigation'
import type { SuperviewFilterOption } from '@/lib/supabase'

/**
 * Filter bar for /produse/superview — same three-dropdown shape and
 * onChange + router.push pattern as CategoryPillBar.tsx on the main /produse
 * listing, but scoped to the already-deduped "one per brand/category/
 * subcategory" superview set rather than the full catalogue: picking a
 * brand here shows one representative product per category/subcategory
 * *within that brand*, not a fresh dedup pass. All the actual filtering
 * happens server-side in getSuperviewProducts() (lib/supabase.ts) — this
 * component only builds the URL.
 */
export default function SuperviewFilters({
  brands,
  categories,
  subcategories,
  activeBrand,
  activeCategory,
  activeSub,
}: {
  brands: SuperviewFilterOption[]
  categories: SuperviewFilterOption[]
  subcategories: SuperviewFilterOption[]
  activeBrand?: string
  activeCategory?: string
  activeSub?: string
}) {
  const router = useRouter()

  const pushWith = (next: { brand?: string; categorie?: string; subcategorie?: string }) => {
    const params = new URLSearchParams()
    if (next.brand) params.set('brand', next.brand)
    if (next.categorie) params.set('categorie', next.categorie)
    if (next.subcategorie) params.set('subcategorie', next.subcategorie)
    const qs = params.toString()
    router.push(qs ? `/produse/superview?${qs}` : '/produse/superview')
  }

  const onBrandChange = (value: string) =>
    pushWith({ brand: value || undefined, categorie: activeCategory, subcategorie: activeSub })
  const onCategoryChange = (value: string) =>
    // Dropping the category clears subcategory too — a subcategory implies
    // a category, so keeping a stale one selected after clearing its parent
    // would silently re-narrow the results without the dropdown showing why.
    pushWith({ brand: activeBrand, categorie: value || undefined, subcategorie: value ? activeSub : undefined })
  const onSubChange = (value: string) =>
    pushWith({ brand: activeBrand, categorie: activeCategory, subcategorie: value || undefined })

  return (
    <>
      <style>{`
        .sv-filters { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 28px; }
        .sv-dropdown { position: relative; display: flex; align-items: center; min-width: 200px; }
        .sv-dropdown select {
          appearance: none; -webkit-appearance: none; width: 100%;
          font-family: 'Recursive', sans-serif; font-size: 13px; font-weight: 500;
          color: rgb(0,0,0); background: rgb(255,255,255);
          border: 1px solid rgba(0,0,0,0.12); border-radius: 8px;
          padding: 10px 34px 10px 14px; min-height: 40px; cursor: pointer;
          transition: border-color 150ms;
        }
        .sv-dropdown select:hover { border-color: rgba(0,0,0,0.3); }
        .sv-dropdown select:disabled { color: rgba(0,0,0,0.3); cursor: not-allowed; }
        .sv-dropdown-chevron { position: absolute; right: 12px; pointer-events: none; color: rgba(0,0,0,0.45); display: flex; }
        .sv-filters-clear {
          display: inline-flex; align-items: center; font-family: 'Inter', sans-serif;
          font-size: 12px; font-weight: 600; color: rgba(0,0,0,0.5);
          text-decoration: underline; text-underline-offset: 2px; background: none;
          border: none; cursor: pointer; padding: 0 4px;
        }
        .sv-filters-clear:hover { color: rgb(217,44,43); }
        @media (max-width: 640px) { .sv-dropdown { min-width: 0; flex: 1 1 140px; } }
      `}</style>

      <div className="sv-filters">
        <div className="sv-dropdown">
          <select value={activeBrand ?? ''} onChange={e => onBrandChange(e.target.value)} aria-label="Brand" disabled={brands.length === 0}>
            <option value="">Toate brandurile</option>
            {brands.map(b => (
              <option key={b.name} value={b.name}>{b.name} ({b.count.toLocaleString('ro')})</option>
            ))}
          </select>
          <span className="sv-dropdown-chevron" aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
          </span>
        </div>

        <div className="sv-dropdown">
          <select value={activeCategory ?? ''} onChange={e => onCategoryChange(e.target.value)} aria-label="Categorie" disabled={categories.length === 0}>
            <option value="">Toate categoriile</option>
            {categories.map(c => (
              <option key={c.name} value={c.name}>{c.name} ({c.count.toLocaleString('ro')})</option>
            ))}
          </select>
          <span className="sv-dropdown-chevron" aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
          </span>
        </div>

        <div className="sv-dropdown">
          <select value={activeSub ?? ''} onChange={e => onSubChange(e.target.value)} aria-label="Subcategorie" disabled={subcategories.length === 0}>
            <option value="">Toate subcategoriile</option>
            {subcategories.map(s => (
              <option key={s.name} value={s.name}>{s.name} ({s.count.toLocaleString('ro')})</option>
            ))}
          </select>
          <span className="sv-dropdown-chevron" aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
          </span>
        </div>

        {(activeBrand || activeCategory || activeSub) && (
          <button type="button" className="sv-filters-clear" onClick={() => router.push('/produse/superview')}>
            Resetează filtrele
          </button>
        )}
      </div>
    </>
  )
}
