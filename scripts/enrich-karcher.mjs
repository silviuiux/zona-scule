/**
 * enrich-karcher.mjs
 * 
 * Citește produsele Kärcher din Supabase, găsește pagina pe kaercher.com/ro,
 * extrage cu Claude descrierea + specs + caracteristici + aplicații,
 * și updatează DB-ul.
 * 
 * Usage:
 *   node scripts/enrich-karcher.mjs              # procesează toate (slow)
 *   node scripts/enrich-karcher.mjs --limit 50   # primele 50
 *   node scripts/enrich-karcher.mjs --sku 1.004-062.0  # un singur produs
 *   node scripts/enrich-karcher.mjs --resume     # skip produsele care au deja descriere reală
 */

import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

// ── Config ────────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
// Use service role key for writes (bypasses RLS), falls back to anon
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE env vars. Run with dotenv or export them first.')
  process.exit(1)
}
if (!ANTHROPIC_KEY) {
  console.error('Missing ANTHROPIC_API_KEY. Add it to .env.local')
  process.exit(1)
}

const usingServiceKey = !!process.env.SUPABASE_SERVICE_KEY
console.log(`DB auth: ${usingServiceKey ? 'service role (full access)' : 'anon key (read-only)'}`)
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY })

// ── CLI args ──────────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
const limitArg = args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1]) : null
const skuArg = args.includes('--sku') ? args[args.indexOf('--sku') + 1] : null
const resumeMode = args.includes('--resume')
const dryRun = args.includes('--dry-run')

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Construct Kärcher search URL from SKU
 * Kärcher SKUs look like: 1.004-062.0
 * Their URL slug looks like: 10040620 (remove dots and dashes)
 */
function skuToKarcherSlug(sku) {
  return sku.replace(/[.\-]/g, '')
}

/**
 * Fetch the Kärcher product page for a given SKU
 * First tries to find via their search API, then fetches the product page
 */
async function fetchKarcherPage(sku, productName) {
  const numericSlug = skuToKarcherSlug(sku)
  console.log(`  → Searching for ${sku} (slug: ${numericSlug})`)

  // Strategy 1: Kärcher internal search API (JSON, no bot protection)
  // This powers the search bar on kaercher.com — returns product URLs directly
  const searchQueries = [
    numericSlug,
    productName?.replace(/\s*\*[A-Z]+\s*/g, ' ').trim(), // clean "AB 20 Ec *EU" → "AB 20 Ec"
    sku,
  ].filter(Boolean)

  for (const q of searchQueries) {
    try {
      const controller = new AbortController()
      setTimeout(() => controller.abort(), 10000)
      const apiUrl = `https://www.kaercher.com/api/startpage/search?q=${encodeURIComponent(q)}&country=ro&language=ro&num=5`
      const res = await fetch(apiUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'ro-RO,ro;q=0.9',
          'Referer': 'https://www.kaercher.com/ro/',
          'Origin': 'https://www.kaercher.com',
          'X-Requested-With': 'XMLHttpRequest',
        }
      })
      if (res.ok) {
        const text = await res.text()
        if (!text || text.trim() === '') continue
        const data = JSON.parse(text)
        const allItems = [
          ...(data?.suggestions || []),
          ...(data?.products || []),
          ...(data?.results || []),
          ...(data?.hits || []),
        ]
        for (const item of allItems) {
          const url = item?.url || item?.link || item?.href || item?.productUrl || ''
          if (url && (url.includes(numericSlug) || url.includes(sku.replace(/\./g, '-')))) {
            const fullUrl = url.startsWith('http') ? url : `https://www.kaercher.com${url}`
            console.log(`  → Found via Kärcher API (q="${q}"): ${fullUrl}`)
            return await fetchPage(fullUrl)
          }
        }
      }
    } catch (e) {
      // continue to next query
    }
  }

  // Strategy 2: Bing search (less aggressive than Google for automated requests)
  try {
    const controller = new AbortController()
    setTimeout(() => controller.abort(), 12000)
    const bingUrl = `https://www.bing.com/search?q=site:kaercher.com/ro+${numericSlug}&setlang=ro`
    const res = await fetch(bingUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html',
        'Accept-Language': 'ro-RO,ro;q=0.9',
      }
    })
    if (res.ok) {
      const html = await res.text()
      const regex = new RegExp(`https://www\.kaercher\.com/ro/[^"'<>\s]+${numericSlug}\.html`, 'i')
      const match = html.match(regex)
      if (match) {
        console.log(`  → Found via Bing: ${match[0]}`)
        return await fetchPage(match[0])
      }
    }
  } catch (e) {
    console.log(`  → Bing error: ${e.message}`)
  }

  // Strategy 3: Try common Kärcher URL patterns directly
  // Build name slug from product name
  const nameSlug = (productName || '')
    .toLowerCase()
    .replace(/\*[a-z]+/gi, '')  // remove *EU, *DE etc
    .replace(/[^a-z0-9\s-]/g, ' ')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60)

  // Kärcher URL pattern: kaercher.com/ro/{section}/{category?}/{subcategory?}/{name-slug}-{numericSlug}.html
  // We don't know the category path, so we try: /accesorii/ and /professional/ flat first,
  // then use their sitemap search to find it
  const pathsToTry = [
    // Flat paths (accessories, home, professional)
    `https://www.kaercher.com/ro/accesorii/${nameSlug}-${numericSlug}.html`,
    `https://www.kaercher.com/ro/professional/${nameSlug}-${numericSlug}.html`,
    `https://www.kaercher.com/ro/home-garden/${nameSlug}-${numericSlug}.html`,
  ]

  for (const url of pathsToTry) {
    const result = await fetchPage(url)
    if (result) {
      console.log(`  → Found via direct path: ${url}`)
      return result
    }
  }

  // Strategy 4: Kärcher search page HTML
  try {
    const controller = new AbortController()
    setTimeout(() => controller.abort(), 12000)
    const res = await fetch(
      `https://www.kaercher.com/ro/search/?q=${encodeURIComponent(numericSlug)}`,
      {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
          'Accept': 'text/html',
          'Accept-Language': 'ro-RO,ro;q=0.9',
        }
      }
    )
    if (res.ok) {
      const html = await res.text()
      const regex = new RegExp(`href="(/ro/[^"]+${numericSlug}\.html)"`, 'i')
      const match = html.match(regex)
      if (match) {
        const pageUrl = `https://www.kaercher.com${match[1]}`
        console.log(`  → Found via search page: ${pageUrl}`)
        return await fetchPage(pageUrl)
      }
    }
  } catch (e) {
    console.log(`  → Search page error: ${e.message}`)
  }

  // Strategy 5: Kärcher sitemap index — find exact URL from XML sitemap
  try {
    const controller = new AbortController()
    setTimeout(() => controller.abort(), 12000)
    const sitemapUrl = `https://www.kaercher.com/ro/sitemap-products.xml`
    const res = await fetch(sitemapUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })
    if (res.ok) {
      const xml = await res.text()
      const regex = new RegExp(`(https://www\.kaercher\.com/ro/[^<]+${numericSlug}\.html)`, 'i')
      const match = xml.match(regex)
      if (match) {
        console.log(`  → Found via sitemap: ${match[1]}`)
        return await fetchPage(match[1])
      }
    }
  } catch (e) {
    // sitemap not available
  }

  return null
}

async function fetchPage(url) {
  console.log(`  → Fetching: ${url}`)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000) // 10s timeout
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'ro-RO,ro;q=0.9',
      }
    })
    clearTimeout(timeout)
    console.log(`  → Status: ${res.status}`)
    if (!res.ok) return null
    return { url, html: await res.text() }
  } catch (e) {
    clearTimeout(timeout)
    console.log(`  → Fetch error: ${e.message}`)
    return null
  }
}

/**
 * Use Claude to extract structured product data from Kärcher page HTML
 */
async function extractWithClaude(sku, productName, html, pageUrl) {
  // Strip scripts/styles to reduce tokens
  const cleaned = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 8000) // ~2k tokens

  const prompt = `Ești un expert în produse industriale. Analizează textul de mai jos de pe pagina produsului Kärcher cu SKU "${sku}" (${productName}).

Extrage datele și returnează DOAR un JSON valid, fără alt text:

{
  "short_description": "2-3 propoziții care descriu exact ce face produsul, pentru cine e și beneficiile principale. În română. MAX 300 caractere.",
  "st1_label": "Prima specificație tehnică (ex: Putere motor, Debit aer, Capacitate)",
  "st1_value": "Valoarea cu unitate (ex: 1200 W, 20 m³/h)",
  "st1_details": "Explicație scurtă a specificației în română",
  "st2_label": "A doua specificație tehnică",
  "st2_value": "Valoarea cu unitate",
  "st2_details": "Explicație scurtă",
  "st3_label": "A treia specificație tehnică",
  "st3_value": "Valoarea cu unitate",
  "st3_details": "Explicație scurtă",
  "c1_title": "Prima caracteristică/beneficiu cheie (max 5 cuvinte)",
  "c1_details": "Descriere caracteristică în română (max 100 caractere)",
  "c2_title": "A doua caracteristică/beneficiu",
  "c2_details": "Descriere",
  "c3_title": "A treia caracteristică/beneficiu",
  "c3_details": "Descriere",
  "app_01_title": "Prima aplicație recomandată (ex: Curățare industrială)",
  "app_01_details": "Descriere aplicație (max 100 caractere)",
  "app_02_title": "A doua aplicație",
  "app_02_details": "Descriere",
  "app_03_title": "A treia aplicație",
  "app_03_details": "Descriere"
}

Dacă nu găsești o valoare, pune null. Nu inventa date care nu sunt în text.

TEXT PAGINA:
${cleaned}`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].text.trim()
  
  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON in response')
  
  return JSON.parse(jsonMatch[0])
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function processProduct(product) {
  const { id, sku, name } = product
  
  console.log(`\n[${sku}] ${name}`)
  
  // 1. Fetch Kärcher page
  const page = await fetchKarcherPage(sku, name)
  if (!page) {
    console.log(`  ⚠ Page not found`)
    return { id, status: 'not_found' }
  }
  console.log(`  ✓ Found: ${page.url}`)
  
  // 2. Extract with Claude
  let data
  try {
    data = await extractWithClaude(sku, name, page.html, page.url)
    console.log(`  ✓ Extracted: "${data.short_description?.slice(0, 60)}..."`)
  } catch (e) {
    console.log(`  ✗ Extraction failed: ${e.message}`)
    return { id, status: 'extraction_failed' }
  }
  
  if (dryRun) {
    console.log('  [DRY RUN] Would update:', JSON.stringify(data, null, 2))
    return { id, status: 'dry_run' }
  }
  
  // 3. Update Supabase
  const { error } = await supabase
    .from('products')
    .update({
      short_description: data.short_description,
      manufacturer_url: page.url,
      st1_label: data.st1_label,
      st1_value: data.st1_value,
      st1_details: data.st1_details,
      st2_label: data.st2_label,
      st2_value: data.st2_value,
      st2_details: data.st2_details,
      st3_label: data.st3_label,
      st3_value: data.st3_value,
      st3_details: data.st3_details,
      c1_title: data.c1_title,
      c1_details: data.c1_details,
      c2_title: data.c2_title,
      c2_details: data.c2_details,
      c3_title: data.c3_title,
      c3_details: data.c3_details,
      app_01_title: data.app_01_title,
      app_01_details: data.app_01_details,
      app_02_title: data.app_02_title,
      app_02_details: data.app_02_details,
      app_03_title: data.app_03_title,
      app_03_details: data.app_03_details,
    })
    .eq('id', id)
  
  if (error) {
    console.log(`  ✗ DB update failed: ${error.message}`)
    return { id, status: 'db_error' }
  }
  
  console.log(`  ✓ DB updated`)
  return { id, status: 'success', url: page.url }
}

async function main() {
  console.log('🔧 Kärcher Product Enrichment Script')
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'} | Resume: ${resumeMode}`)
  
  // Build query
  let query = supabase
    .from('products')
    .select('id, sku, name, short_description, manufacturer_url')
    .not('sku', 'is', null)

  // Single SKU mode — most specific, goes first
  if (skuArg) {
    query = query.eq('sku', skuArg)
  } else {
    // Only filter by brand when not in single-SKU mode
    query = query.eq('brand_name', 'Karcher')
    // In resume mode, skip products already enriched
    if (resumeMode) {
      query = query.is('manufacturer_url', null)
    }
    if (limitArg) {
      query = query.limit(limitArg)
    } else {
      query = query.limit(2639) // explicit cap
    }
  }
  
  const { data: products, error } = await query
  if (error) throw error
  
  console.log(`\nFound ${products.length} products to process\n`)
  if (products.length === 0) process.exit(0)
  
  // Process with delay to avoid rate limiting
  const results = { success: 0, not_found: 0, failed: 0 }
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i]
    process.stdout.write(`[${i + 1}/${products.length}] `)
    
    const result = await processProduct(product)
    
    if (result.status === 'success') results.success++
    else if (result.status === 'not_found') results.not_found++
    else if (result.status === 'dry_run') results.success++
    else results.failed++
    
    // Rate limit: 1 request per 2 seconds (Claude API) + Kärcher fetch
    if (i < products.length - 1) {
      await new Promise(r => setTimeout(r, 2000))
    }
  }
  
  console.log('\n\n── Summary ──────────────────────────────')
  console.log(`✓ Success:   ${results.success}`)
  console.log(`⚠ Not found: ${results.not_found}`)
  console.log(`✗ Failed:    ${results.failed}`)
  console.log(`Total:       ${products.length}`)
}

main().catch(console.error)
