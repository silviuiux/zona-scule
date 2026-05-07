/**
 * import-karcher-descriptions.mjs
 * Imports short_description from KARCHER-Grid_view.csv into Supabase
 * 
 * Usage:
 *   node --env-file=.env.local scripts/import-karcher-descriptions.mjs path/to/KARCHER-Grid_view.csv
 */

import { createClient } from '@supabase/supabase-js'
import { createReadStream } from 'fs'
import { createInterface } from 'readline'
import { resolve } from 'path'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE env vars')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const csvPath = resolve(process.argv[2] || 'KARCHER-Grid_view.csv')

console.log(`📂 Reading: ${csvPath}`)

// Parse CSV
async function parseCSV(filePath) {
  const rows = []
  const rl = createInterface({ input: createReadStream(filePath), crlfDelay: Infinity })
  let headers = null

  for await (const line of rl) {
    const cols = parseCSVLine(line)
    if (!headers) {
      // Remove BOM if present
      headers = cols.map(h => h.replace(/^\uFEFF/, '').trim())
    } else {
      const row = {}
      headers.forEach((h, i) => { row[h] = (cols[i] || '').trim() })
      rows.push(row)
    }
  }
  return rows
}

function parseCSVLine(line) {
  const result = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i+1] === '"') { current += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}

async function main() {
  const rows = await parseCSV(csvPath)
  console.log(`📊 Found ${rows.length} rows in CSV`)

  // Build updates array
  const updates = rows
    .filter(r => r['SKU'] && r['Short Description'])
    .map(r => ({ sku: r['SKU'], desc: r['Short Description'] }))

  console.log(`✏️  ${updates.length} rows with descriptions to import`)
  console.log(`\nSample:`)
  updates.slice(0, 3).forEach(u => {
    console.log(`  ${u.sku}: ${u.desc.slice(0, 70)}...`)
  })

  // Process in batches of 50 (upsert per row via supabase)
  const BATCH = 50
  let success = 0, failed = 0

  for (let i = 0; i < updates.length; i += BATCH) {
    const batch = updates.slice(i, i + BATCH)
    
    // Build a single update per batch using RPC
    // We'll do individual updates but fire them concurrently per batch
    const promises = batch.map(({ sku, desc }) =>
      supabase
        .from('products')
        .update({ short_description: desc })
        .eq('sku', sku)
    )
    
    const results = await Promise.all(promises)
    const batchSuccess = results.filter(r => !r.error).length
    const batchFailed = results.filter(r => r.error).length
    success += batchSuccess
    failed += batchFailed

    process.stdout.write(`\r  Progress: ${i + batch.length}/${updates.length} — ✓ ${success} ✗ ${failed}`)
  }

  console.log(`\n\n── Done ──────────────────────────`)
  console.log(`✓ Updated: ${success}`)
  console.log(`✗ Failed:  ${failed}`)
  console.log(`Total:     ${updates.length}`)
}

main().catch(console.error)
