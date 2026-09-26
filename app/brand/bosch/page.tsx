import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import BrandLandingTemplate from '@/components/BrandLandingTemplate'
import { getBrandBySlug, getSubcategoriesByBrandName, getApplicationGroupsByBrand, getSubcategoryGroupsByBrand } from '@/lib/supabase'
import { getBrandPageConfig } from '@/lib/brand-content'

// ─────────────────────────────────────────────────────────────────────────
// Brand Landing Page — BOSCH
// Thin data-fetching wrapper, same pattern as the other brand pages.
// ─────────────────────────────────────────────────────────────────────────

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const config = getBrandPageConfig('bosch')
  if (!config) return {}
  return { title: config.metaTitle, description: config.metaDescription }
}

export default async function BoschBrandPage() {
  const config = getBrandPageConfig('bosch')
  if (!config) return notFound()

  const [brand, subcategories, applicationGroups, subcategoryGroups] = await Promise.all([
    getBrandBySlug('bosch'),
    getSubcategoriesByBrandName(config.brandName),
    config.useUseCaseCarousels ? getApplicationGroupsByBrand(config.brandName) : Promise.resolve([]),
    config.useSubcategoryCarousels ? getSubcategoryGroupsByBrand(config.brandName) : Promise.resolve([]),
  ])

  const totalProductCount = subcategories.reduce((sum, s) => sum + s.product_count, 0)

  const brandRow = brand ?? { id: 'bosch', slug: 'bosch', name: config.brandName, logo_url: null, brand_color: '#ED1B2E', country: 'Germania', short_description: null, featured: false }

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
