import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import BrandLandingTemplate from '@/components/BrandLandingTemplate'
import { getBrandBySlug, getSubcategoriesByBrandName, getApplicationGroupsByBrand, getSubcategoryGroupsByBrand } from '@/lib/supabase'
import { getBrandPageConfig } from '@/lib/brand-content'

// ─────────────────────────────────────────────────────────────────────────
// Brand Landing Page — RUKO
// Thin data-fetching wrapper, same pattern as the other brand pages. Ruko's
// subcategory data is essentially flat (nearly every row is "Burghie"), so
// this page leans on curated pillars (see lib/brand-content.ts's ruko entry)
// sourced from ruko_nomenclature_blueprint.md, same hand-curated pattern as
// PFERD/OSBORN rather than Karcher's live-carousel pattern.
// ─────────────────────────────────────────────────────────────────────────

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const config = getBrandPageConfig('ruko')
  if (!config) return {}
  return { title: config.metaTitle, description: config.metaDescription }
}

export default async function RukoBrandPage() {
  const config = getBrandPageConfig('ruko')
  if (!config) return notFound()

  const [brand, subcategories, applicationGroups, subcategoryGroups] = await Promise.all([
    getBrandBySlug('ruko'),
    getSubcategoriesByBrandName(config.brandName),
    config.useUseCaseCarousels ? getApplicationGroupsByBrand(config.brandName) : Promise.resolve([]),
    config.useSubcategoryCarousels ? getSubcategoryGroupsByBrand(config.brandName) : Promise.resolve([]),
  ])

  const totalProductCount = subcategories.reduce((sum, s) => sum + s.product_count, 0)

  const brandRow = brand ?? { id: 'ruko', slug: 'ruko', name: config.brandName, logo_url: null, brand_color: '#003F87', country: 'Germania', short_description: null, featured: true }

  return (
    <>
      <Nav />
      <BrandLandingTemplate
        brand={brandRow}
        config={config}
        subcategories={subcategories}
        applicationGroups={applicationGroups}
        subcategoryGroups={subcategoryGroups}
        totalProductCount={totalProductCount}
      />
      <Footer />
    </>
  )
}
