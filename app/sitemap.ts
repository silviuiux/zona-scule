import type { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

export const revalidate = 86400 // refresh daily

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://www.zonascule.online'

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/produse`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/contact`, changeFrequency: 'monthly', priority: 0.5 },
  ]

  let cats: { name: string }[] | null = null
  let products: { slug: string }[] | null = null
  try {
    const [c, p] = await Promise.all([
      supabase.from('categories').select('name'),
      supabase
        .from('products')
        .select('slug, created_at')
        .not('slug', 'is', null)
        .not('main_image_storage_url', 'is', null)
        .order('created_at', { ascending: false })
        .limit(10000),
    ])
    cats = c.data
    products = p.data as { slug: string }[] | null
  } catch {
    // DB unreachable — ship the static routes only.
  }

  const catRoutes: MetadataRoute.Sitemap = (cats ?? []).map(c => ({
    url: `${base}/produse?categorie=${encodeURIComponent(c.name)}`,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const productRoutes: MetadataRoute.Sitemap = (products ?? []).map(p => ({
    url: `${base}/produse/${p.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticRoutes, ...catRoutes, ...productRoutes]
}
