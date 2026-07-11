'use client'
import { useRouter } from 'next/navigation'
import type { CategoryWithCount, BrandWithCount, SubcategoryWithCount } from '@/lib/supabase'

/**
 * Collapsed-sidebar view for the /produse listing page (desktop only).
 *
 * Three plain dropdowns — Categorie / Brand / Subcategorie — replace the
 * vertical Sidebar list. Each select mirrors the href logic Sidebar.tsx /
 * SubcategoryBar.tsx already use for the same filters, just triggered via
 * onChange + router.push instead of a Link click. Toggled by CatalogLayout;
 * only one of Sidebar / this component is visible at a time (CSS-driven,
 * see CatalogLayout.tsx).
 */
export default function CatalogDropdowns({
  categories,
  brands,
  subcategories,
  activeCat,
  activeBrand,
  activeSub,
}: {
  categories: CategoryWithCount[]
  brands: BrandWithCount[]
  subcategories: SubcategoryWithCount[]
  activeCat?: string
  activeBrand?: string
  activeSub?: string
}) {
  const router = useRouter()

  const onCategoryChange = (value: string) => {
    // Matches Sidebar.tsx's category links: picking a category drops any
    // existing brand/subcategory filter, picking "Toate" goes back to /produse.
    router.push(value ? `/produse?categorie=${encodeURIComponent(value)}` : '/produse')
  }

  const onBrandChange = (value: string) => {
    // Matches Sidebar.tsx's brand href logic: preserve category, drop subcategory.
    if (!value) {
      router.push(activeCat ? `/produse?categorie=${encodeURIComponent(activeCat)}` : '/produse')
      return
    }
    router.push(
      activeCat
        ? `/produse?categorie=${encodeURIComponent(activeCat)}&brand=${encodeURIComponent(value)}`
        : `/produse?brand=${encodeURIComponent(value)}`
    )
  }

  const onSubChange = (value: string) => {
    // Matches SubcategoryBar.tsx's subHref logic: preserve category and/or brand.
    const brandParam = activeBrand ? `&brand=${encodeURIComponent(activeBrand)}` : ''
    if (!value) {
      router.push(
        activeCat
          ? `/produse?categorie=${encodeURIComponent(activeCat)}${brandParam}`
          : activeBrand
          ? `/produse?brand=${encodeURIComponent(activeBrand)}`
          : '/produse'
      )
      return
    }
    router.push(
      activeCat
        ? `/produse?categorie=${encodeURIComponent(activeCat)}&subcategorie=${encodeURIComponent(value)}${brandParam}`
        : activeBrand
        ? `/produse?brand=${encodeURIComponent(activeBrand)}&subcategorie=${encodeURIComponent(value)}`
        : `/produse?subcategorie=${encodeURIComponent(value)}`
    )
  }

  return (
    <>
      <style>{`
        /* No outer wrapper on purpose — these three cells render as direct
           children of CatalogLayout's ".filter-row" grid (alongside the view
           switcher button), so all four cells share one grid track and end
           up exactly as wide as a product card column. */
        .cat-dropdown {
          position: relative;
          display: flex;
          align-items: center;
          min-width: 0;
        }
        .cat-dropdown select {
          appearance: none;
          -webkit-appearance: none;
          width: 100%;
          font-family: 'Recursive', sans-serif;
          font-size: 13px; font-weight: 500;
          color: rgb(0,0,0);
          background: rgb(255,255,255);
          border: 1px solid rgba(0,0,0,0.12);
          border-radius: 8px;
          padding: 10px 34px 10px 14px;
          min-height: 40px;
          cursor: pointer;
          transition: border-color 150ms;
        }
        .cat-dropdown select:hover { border-color: rgba(0,0,0,0.3); }
        .cat-dropdown select:disabled { color: rgba(0,0,0,0.3); cursor: not-allowed; }
        .cat-dropdown-chevron {
          position: absolute;
          right: 12px;
          pointer-events: none;
          color: rgba(0,0,0,0.45);
          display: flex;
        }
      `}</style>

      <div className="cat-dropdown">
        <select
          value={activeBrand ?? ''}
          onChange={e => onBrandChange(e.target.value)}
          aria-label="Brand"
          disabled={brands.length === 0}
        >
          <option value="">Toate brandurile</option>
          {brands.map(brand => (
            <option key={brand.id} value={brand.name}>
              {brand.name} ({brand.product_count.toLocaleString('ro')})
            </option>
          ))}
        </select>
        <span className="cat-dropdown-chevron" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </span>
      </div>

      <div className="cat-dropdown">
        <select
          value={activeCat ?? ''}
          onChange={e => onCategoryChange(e.target.value)}
          aria-label="Categorie"
        >
          <option value="">Toate categoriile</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.name}>
              {cat.name} ({cat.product_count.toLocaleString('ro')})
            </option>
          ))}
        </select>
        <span className="cat-dropdown-chevron" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </span>
      </div>

      <div className="cat-dropdown">
        <select
          value={activeSub ?? ''}
          onChange={e => onSubChange(e.target.value)}
          aria-label="Subcategorie"
          disabled={subcategories.length === 0}
        >
          <option value="">Toate subcategoriile</option>
          {subcategories.map(sub => (
            <option key={sub.id} value={sub.name}>
              {sub.name} ({sub.product_count.toLocaleString('ro')})
            </option>
          ))}
        </select>
        <span className="cat-dropdown-chevron" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </span>
      </div>
    </>
  )
}
