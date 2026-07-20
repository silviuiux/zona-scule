import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import BrandLandingTemplate from '@/components/BrandLandingTemplate'
import { getBrandBySlug, getSubcategoriesByBrandName, getApplicationGroupsByBrand, getSubcategoryGroupsByBrand } from '@/lib/supabase'
import { getBrandPageConfig } from '@/lib/brand-content'

// ─────────────────────────────────────────────────────────────────────────
// Brand Landing Page — MILWAUKEE
// Thin data-fetching wrapper, same pattern as the other brand pages.
// Milwaukee is the one brand with BOTH real app_01_title data (3597/4669
// rows) and a wide subcategory spread, so it fetches both application
// groups AND subcategory groups — see lib/brand-content.ts's milwaukee
// entry for why both flags are true here.
// ─────────────────────────────────────────────────────────────────────────

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const config = getBrandPageConfig('milwaukee')
  if (!config) return {}
  return { title: config.metaTitle, description: config.metaDescription }
}

export default async function MilwaukeeBrandPage() {
  const config = getBrandPageConfig('milwaukee')
  if (!config) return notFound()

  const [brand, subcategories, applicationGroups, subcategoryGroups] = await Promise.all([
    getBrandBySlug('milwaukee'),
    getSubcategoriesByBrandName(config.brandName),
    config.useUseCaseCarousels ? getApplicationGroupsByBrand(config.brandName) : Promise.resolve([]),
    config.useSubcategoryCarousels ? getSubcategoryGroupsByBrand(config.brandName) : Promise.resolve([]),
  ])

  const totalProductCount = subcategories.reduce((sum, s) => sum + s.product_count, 0)

  const brandRow = brand ?? { id: 'milwaukee', slug: 'milwaukee', name: config.brandName, logo_url: null, brand_color: '#DB011C', country: 'Statele Unite', short_description: null, featured: true }

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
