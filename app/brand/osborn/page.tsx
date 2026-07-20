import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import BrandLandingTemplate from '@/components/BrandLandingTemplate'
import { getBrandBySlug, getSubcategoriesByBrandName, getApplicationGroupsByBrand, getSubcategoryGroupsByBrand } from '@/lib/supabase'
import { getBrandPageConfig } from '@/lib/brand-content'

// ─────────────────────────────────────────────────────────────────────────
// Brand Landing Page — OSBORN
// Thin data-fetching wrapper, same pattern as app/brand/pferd and
// app/brand/karcher. OSBORN has no app_01_title data at all, so it follows
// the PFERD hand-curated pattern (pillars + glossary sourced from
// nomenclator_osborn.md) rather than the Karcher-style live carousels.
//
// Deliberately left OUT of <Nav /> / sitemap for now — reachable only by
// direct URL (/brand/osborn), same as every other brand page.
// ─────────────────────────────────────────────────────────────────────────

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const config = getBrandPageConfig('osborn')
  if (!config) return {}
  return { title: config.metaTitle, description: config.metaDescription }
}

export default async function OsbornBrandPage() {
  const config = getBrandPageConfig('osborn')
  if (!config) return notFound()

  const [brand, subcategories, applicationGroups, subcategoryGroups] = await Promise.all([
    getBrandBySlug('osborn'),
    getSubcategoriesByBrandName(config.brandName),
    config.useUseCaseCarousels ? getApplicationGroupsByBrand(config.brandName) : Promise.resolve([]),
    config.useSubcategoryCarousels ? getSubcategoryGroupsByBrand(config.brandName) : Promise.resolve([]),
  ])

  const totalProductCount = subcategories.reduce((sum, s) => sum + s.product_count, 0)

  // brands.brand_color is null for Osborn — template ignores it anyway
  // (fixed site-red accent), so the fallback here is just a placeholder.
  const brandRow = brand ?? { id: 'osborn', slug: 'osborn', name: config.brandName, logo_url: null, brand_color: '#1a1a1a', country: 'Germania', short_description: null, featured: true }

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
