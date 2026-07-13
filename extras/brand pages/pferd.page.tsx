import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import BrandLandingTemplate from '@/components/BrandLandingTemplate'
import { getBrandBySlug, getSubcategoriesByBrandName, getApplicationGroupsByBrand } from '@/lib/supabase'
import { getBrandPageConfig } from '@/lib/brand-content'

// ─────────────────────────────────────────────────────────────────────────
// Brand Landing Page — PFERD
// Thin data-fetching wrapper around the shared BrandLandingTemplate — all
// copy/structure now lives in lib/brand-content.ts (PFERD entry) and the
// template itself (components/BrandLandingTemplate.tsx). This file used to
// be the ~500-line original template; it's kept as the reference
// implementation for the hand-curated (no structured `applications` field)
// brand pattern. See app/brand/karcher for the data-driven pattern.
//
// Deliberately left OUT of <Nav /> / sitemap for now — no entry point is
// wired up yet. Reachable only by direct URL (/brand/pferd) until we decide
// where it hooks into the main nav / brand index (see app/brand/page.tsx).
// ─────────────────────────────────────────────────────────────────────────

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const config = getBrandPageConfig('pferd')
  if (!config) return {}
  return { title: config.metaTitle, description: config.metaDescription }
}

export default async function PferdBrandPage() {
  const config = getBrandPageConfig('pferd')
  if (!config) return notFound()

  const [brand, subcategories, applicationGroups] = await Promise.all([
    getBrandBySlug('pferd'),
    getSubcategoriesByBrandName(config.brandName),
    config.useUseCaseCarousels ? getApplicationGroupsByBrand(config.brandName) : Promise.resolve([]),
  ])

  const totalProductCount = subcategories.reduce((sum, s) => sum + s.product_count, 0)

  // Brand row may not exist yet in the `brands` table (slug wasn't required
  // pre-template) — fall back to a minimal shape so the page still renders
  // with the default accent color rather than 404-ing.
  const brandRow = brand ?? { id: 'pferd', slug: 'pferd', name: config.brandName, logo_url: null, brand_color: '#d92c2b', country: 'Germania', short_description: null, featured: true }

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
