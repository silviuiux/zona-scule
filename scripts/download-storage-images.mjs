/**
 * download-storage-images.mjs
 * Downloads all product images from Supabase Storage to local disk.
 * Organized by brand: images/karcher/sku-main.jpg
 * 
 * Usage:
 *   node --env-file=.env.local scripts/download-storage-images.mjs
 *   node --env-file=.env.local scripts/download-storage-images.mjs --brand Karcher
 *   node --env-file=.env.local scripts/download-storage-images.mjs --limit 100
 * 
 * Output: ./images-backup/{brand}/{sku}.{ext}
 */

import { createClient } from '@supabase/supabase-js'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, extname } from 'path'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const args = process.argv.slice(2)
const brandFilter = args.includes('--brand') ? args[args.indexOf('--brand') + 1] : null
const limitArg = args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1]) : null
const OUTPUT_DIR = './images-backup'

async function main() {
  console.log(`📦 Downloading images to: ${OUTPUT_DIR}`)
  console.log(`Filter: ${brandFilter || 'all brands'}\n`)

  // Get ALL products with storage URLs using pagination
  const products = []
  const PAGE = 1000
  let from = 0

  while (true) {
    let query = supabase
      .from('products')
      .select('sku, brand_name, main_image_storage_url')
      .not('main_image_storage_url', 'is', null)
      .range(from, from + PAGE - 1)

    if (brandFilter) query = query.ilike('brand_name', brandFilter)

    const { data, error } = await query
    if (error) throw error
    if (!data || data.length === 0) break

    products.push(...data)
    process.stdout.write(`  Loading products: ${products.length}...`)

    if (data.length < PAGE) break
    from += PAGE

    if (limitArg && products.length >= limitArg) {
      products.splice(limitArg)
      break
    }
  }
  console.log(`  Loaded ${products.length} products        `)

  console.log(`Found ${products.length} products with images\n`)

  let success = 0, failed = 0, skipped = 0

  for (let i = 0; i < products.length; i++) {
    const { sku, brand_name, main_image_storage_url } = products[i]
    if (!main_image_storage_url) continue

    const brand = (brand_name || 'unknown').toLowerCase().replace(/[^a-z0-9]/g, '-')
    const cleanSku = (sku || 'unknown').replace(/[^a-zA-Z0-9._-]/g, '-')
    const ext = extname(main_image_storage_url) || '.jpg'
    const dir = join(OUTPUT_DIR, brand)
    const filepath = join(dir, `${cleanSku}${ext}`)

    // Skip if already downloaded
    if (existsSync(filepath)) {
      skipped++
      continue
    }

    process.stdout.write(`\r[${i+1}/${products.length}] ${brand}/${cleanSku}${ext}          `)

    try {
      // Download from Supabase Storage URL
      const res = await fetch(main_image_storage_url)
      if (!res.ok) { failed++; continue }

      const buffer = Buffer.from(await res.arrayBuffer())
      mkdirSync(dir, { recursive: true })
      writeFileSync(filepath, buffer)
      success++
    } catch (e) {
      failed++
    }

    // Small delay to avoid hammering
    if (i % 50 === 0 && i > 0) await new Promise(r => setTimeout(r, 100))
  }

  console.log(`\n\n── Summary ──────────────────────────────`)
  console.log(`✓ Downloaded: ${success}`)
  console.log(`⏭  Skipped (already exists): ${skipped}`)
  console.log(`✗ Failed: ${failed}`)
  console.log(`📁 Location: ${OUTPUT_DIR}/`)
  console.log(`\nRun again anytime to resume — skips existing files.`)
}

main().catch(console.error)
