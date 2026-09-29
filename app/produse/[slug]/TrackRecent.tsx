'use client'
import { useEffect } from 'react'
import { recordRecent, type RecentProduct } from '@/lib/recently-viewed'

/** Records this product page in the browser's recently-viewed list. */
export default function TrackRecent(props: Omit<RecentProduct, 't'>) {
  const { slug, name, brand, sku, image } = props
  useEffect(() => { recordRecent({ slug, name, brand, sku, image }) }, [slug, name, brand, sku, image])
  return null
}
