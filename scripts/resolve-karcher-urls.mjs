/**
 * resolve-karcher-urls.mjs
 * 
 * Reads KARCHER-Grid_view.csv, follows the search redirect for each product
 * to get the real product page URL, then stores it in Supabase as manufacturer_url.
 * 
 * The CSV has URLs like:
 *   https://www.kaercher.com/ro/cautare-rezultate.html?query=1.004-062.0
 * 
 * Following the redirect or scraping the search results page gives us:
 *   https://www.kaercher.com/ro/professional/.../ab-20-ec-10040620.html
 * 
 * Usage:
 *   node --env-file=.env.local scripts/resolve-karcher-urls.mjs KARCHER-Grid_view.csv
 *   node --env-file=.env.local scripts/resolve-karcher-urls.mjs KARCHER-Grid_view.csv --limit 20
 *   node --env-file=.env.local scripts/resolve-karcher-urls.mjs KARCHER-Grid_view.csv --resume
 */

import { createClient } from '@supabase/supabase-js'
import { createReadStream } from 'fs'
import { createInterface } from 'readline'
import { resolve } from 'path'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) { console.error('Missing SUPABASE env vars'); process.exit(1) }

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const csvPath = resolve(process.argv[2] || 'KARCHER-Grid_view.csv')
const args = process.argv.slice(3)
const limitArg = args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1]) : null
const resumeMode = args.includes('--resume')

// ── CSV Parser ────────────────────────────────────────────────────────────────

function parseCSVLine(line) {
  const result = []
  let current = '', inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i+1] === '"') { current += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      result.push(current); current = ''
    } else current += ch
  }
  result.push(current)
  return result
}

async function parseCSV(filePath) {
  const rows = []
  const rl = createInterface({ input: createReadStream(filePath), crlfDelay: Infinity })
  let headers = null
  for await (const line of rl) {
    const cols = parseCSVLine(line)
    if (!headers) { headers = cols.map(h => h.replace(/^\uFEFF/, '').trim()) }
    else { const row = {}; headers.forEach((h, i) => { row[h] = (cols[i] || '').trim() }); rows.push(row) }
  }
  return rows
}

// ── URL Resolution ────────────────────────────────────────────────────────────

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml',
  'Accept-Language': 'ro-RO,ro;q=0.9',
}

async function resolveProductUrl(searchUrl, sku) {
  const numericSlug = sku.replace(/[.\-]/g, '')
  
  // Strategy 1: Follow the search URL — Kärcher search page has product links in HTML
  try {
    const controller = new AbortController()
    setTimeout(() => controller.abort(), 12000)
    const res = await fetch(searchUrl, { signal: controller.signal, headers: HEADERS })
    
    if (res.ok) {
      const html = await res.text()
      // Look for product URL containing the numeric slug
      const regex = new RegExp(`href="(/ro/[^"]+${numericSlug}[^"]*\\.html)"`, 'i')
      const match = html.match(regex)
      if (match) {
        return `https://www.kaercher.com${match[1]}`
      }
      
      // Also check if we were redirected to the product page directly
      if (res.url && res.url.includes(numericSlug) && res.url.includes('.html')) {
        return res.url
      }
      
      // Try to find any product link in search results
      const anyProduct = html.match(/href="(\/ro\/(?:professional|home-garden|accesorii)\/[^"]+\.html)"/)
      if (anyProduct && !anyProduct[1].includes('search')) {
        return `https://www.kaercher.com${anyProduct[1]}`
      }
    }
  } catch (e) {
    // timeout or network error
  }

  // Strategy 2: Try Kärcher's JSON search API
  try {
    const controller = new AbortController()
    setTimeout(() => controller.abort(), 10000)
    const apiUrl = `https://www.kaercher.com/api/startpage/search?q=${encodeURIComponent(sku)}&country=ro&language=ro&num=5`
    const res = await fetch(apiUrl, {
      signal: controller.signal,
      headers: { ...HEADERS, 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest', 'Referer': 'https://www.kaercher.com/ro/' }
    })
    if (res.ok) {
      const text = await res.text()
      if (text && text.trim().startsWith('{')) {
        const data = JSON.parse(text)
        const items = [...(data?.suggestions||[]), ...(data?.products||[]), ...(data?.results||[])]
        for (const item of items) {
          const url = item?.url || item?.link || ''
          if (url && url.includes(numericSlug)) {
            return url.startsWith('http') ? url : `https://www.kaercher.com${url}`
          }
        }
      }
    }
  } catch (e) {}

  // Strategy 3: Direct path construction
  const nameSlug = numericSlug // simplest fallback
  const paths = [
    `https://www.kaercher.com/ro/accesorii/${nameSlug}.html`,
    `https://www.kaercher.com/ro/search/?q=${numericSlug}`,
  ]
  
  return null // not found
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`📂 Reading: ${csvPath}`)
  const rows = await parseCSV(csvPath)
  console.log(`📊 ${rows.length} rows in CSV`)

  // If resume mode, get already-resolved SKUs from Supabase
  let resolvedSkus = new Set()
  if (resumeMode) {
    const { data } = await supabase
      .from('products')
      .select('sku')
      .not('manufacturer_url', 'is', null)
      .eq('brand_name', 'Karcher')
    resolvedSkus = new Set((data || []).map(r => r.sku))
    console.log(`⏭  Skipping ${resolvedSkus.size} already resolved`)
  }

  // Filter rows
  let toProcess = rows.filter(r => {
    const url = r['Manufacturer URL'] || ''
    return r['SKU'] && url.includes('kaercher.com') && !resolvedSkus.has(r['SKU'])
  })

  if (limitArg) toProcess = toProcess.slice(0, limitArg)
  console.log(`\n🔍 Resolving ${toProcess.length} product URLs...\n`)

  const results = { found: 0, notFound: 0, error: 0 }

  for (let i = 0; i < toProcess.length; i++) {
    const row = toProcess[i]
    const sku = row['SKU']
    const searchUrl = row['Manufacturer URL']
    
    process.stdout.write(`[${i+1}/${toProcess.length}] ${sku}... `)

    const productUrl = await resolveProductUrl(searchUrl, sku)

    if (productUrl) {
      // Save to Supabase
      const { error } = await supabase
        .from('products')
        .update({ manufacturer_url: productUrl })
        .eq('sku', sku)
      
      if (error) {
        console.log(`✗ DB error: ${error.message}`)
        results.error++
      } else {
        console.log(`✓ ${productUrl.split('/ro/')[1]?.slice(0, 60)}`)
        results.found++
      }
    } else {
      console.log(`⚠ not found`)
      results.notFound++
    }

    // Polite delay
    if (i < toProcess.length - 1) await new Promise(r => setTimeout(r, 1500))
  }

  console.log(`\n── Summary ───────────────────────────`)
  console.log(`✓ Resolved: ${results.found}`)
  console.log(`⚠ Not found: ${results.notFound}`)
  console.log(`✗ Errors: ${results.error}`)
}

main().catch(console.error)
