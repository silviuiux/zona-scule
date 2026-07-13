import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import BrandLandingTemplate from '@/components/BrandLandingTemplate'
import { getBrandBySlug, getSubcategoriesByBrandName, getApplicationGroupsByBrand } from '@/lib/supabase'
import { getBrandPageConfig } from '@/lib/brand-content'

// ─────────────────────────────────────────────────────────────────────────
// Brand Landing Page — Karcher
// Second flagship page on the shared template (see app/brand/pferd for the
// hand-curated pattern). This one leans on real data instead of curated
// copy: Karcher's product rows already carry populated app_01_title values
// from the enrichment pipeline (scripts/enrich-karcher.mjs), so the
// "find the right tool for your job" section is driven live by
// getApplicationGroupsByBrand() rather than a hardcoded chip list — this is
// the concrete implementation of the application-based-discovery
// differentiator from the brand-pages research spec.
//
// Same nav/sitemap note as PFERD: reachable only by direct URL until wired
// into <Nav /> / app/brand/page.tsx.
// ─────────────────────────────────────────────────────────────────────────

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const config = getBrandPageConfig('karcher')
  if (!config) return {}
  return { title: config.metaTitle, description: config.metaDescription }
}

export default async function KarcherBrandPage() {
  const config = getBrandPageConfig('karcher')
  if (!config) return notFound()

  const [brand, subcategories, applicationGroups] = await Promise.all([
    getBrandBySlug('karcher'),
    getSubcategoriesByBrandName(config.brandName),
    config.useUseCaseCarousels ? getApplicationGroupsByBrand(config.brandName) : Promise.resolve([]),
  ])

  const totalProductCount = subcategories.reduce((sum, s) => sum + s.product_count, 0)

  const brandRow = brand ?? { id: 'karcher', slug: 'karcher', name: config.brandName, logo_url: null, brand_color: '#005f9e', country: 'Germania', short_description: null, featured: true }

  return (
    <>
      <Nav />
      <BrandLandingTemplate
        brand={brandRow}
        config={config}
        subcategories={subcategories}
        applicationGroups={applicationGroups}
        totalProductCount={totalProductCount}
      />
      <Footer />
    </>
  )
}
